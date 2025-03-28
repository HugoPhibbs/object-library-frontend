import {FormField} from "@/app/home/SearchFilterComponent";
import {ceil, round} from "lodash";

export class FormValues {

    search?: string;
    range: Record<FormField, { min: number, max: number }>;
    exact: Record<FormField, { tol?: number, val: number }>;
    match: Record<FormField, string>;
    boolean: Record<FormField, boolean>;

    constructor(search: string,
                range: Record<FormField, { min: number, max: number }>,
                exact: Record<FormField, { tol?: number, val: number }>,
                match: Record<FormField, string>,
                boolean: Record<FormField, boolean>) {
        this.search = search;
        this.range = range;
        this.exact = exact;
        this.match = match;
        this.boolean = boolean;
    }

    static zeroOrTruthy(value: any): boolean {
        return value === 0 || value;
    }


    static toFlatObject(formValues: FormValues): any {
        console.log(formValues);

        const result: any = {};

        if (FormValues.zeroOrTruthy(formValues.search)) {
            result["search"] = formValues.search;
        }

        for (const key in formValues.match) {
            const typedKey = key as FormField;
            const value = formValues.match[typedKey];

            if (FormValues.zeroOrTruthy(value)) {
                result[`match_${decodeField(key)}`] = formValues.match[typedKey];
            }
        }

        for (const key in formValues.range) {
            const typedKey = key as FormField;
            const min = formValues.range[typedKey].min;
            const max = formValues.range[typedKey].max;

            if (!FormValues.zeroOrTruthy(min) && !FormValues.zeroOrTruthy(max)) {
                continue;
            }

            let result_string = "";

            if (FormValues.zeroOrTruthy(min)) {
                result_string += `${min}`;
            }

            result_string += "to";

            if (FormValues.zeroOrTruthy(max)) {
                result_string += `${max}`;
            }

            result[`range_${decodeField(key)}`] = result_string;
        }

        for (const key in formValues.boolean) {
            const val: boolean = formValues.boolean[key]
            if (val !== null) { // null is a non-present filter
                result[`bool_${key}`] = val ? 1 : 0;
            }
        }

        for (const key in formValues.exact) {
            let val, tol;
            if (typeof formValues.exact[key] === 'object' && formValues.exact[key] !== null) {
                ({ val, tol } = formValues.exact[key]);
            } else {
                val = formValues.exact[key];
            }

            if (FormValues.zeroOrTruthy(val)) {
                val = Number(val)
                if (tol && tol != 0) {
                    tol = Number(tol)
                    const toleranceValue = ceil(val * tol / 100, 1);

                    result[`range_${decodeField(key)}`] = `${round(val - toleranceValue, 1)}to${round(val + toleranceValue, 1)}`;
                } else {
                    result[decodeField(key)] = val;
                }
            }
        }

        return result;
    }
}

export function encodeField(field: FormField): string {
    return field.replace(".", "%2E");
}

function decodeField(field: string): FormField {
    return field.replace("%2E", ".") as FormField;
}