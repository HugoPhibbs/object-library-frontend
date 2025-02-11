"use client";

import api from "../../api";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {TextField, Button, Box, Switch, FormControlLabel, Slider} from "@mui/material";
import {useState} from "react";

type FormField = "search" | "Material" | "Dimensions.Height" | "Dimensions.Width" | "Dimensions.Length" | "demofield";

function encodeField(field: FormField): string {
    return field.replace(".", "%2E");
}

function decodeField(field: string): FormField {
    return field.replace("%2E", ".") as FormField;
}

type FormValues2 = {
    search: string,
    material: string,
    range: {
        "Dimensions.Height": [number, number],
        "Dimensions.Width": [number, number],
        "Dimensions.Length": [number, number]
    },
    exact: {
        "Dimensions.Height": number,
        "Dimensions.Width": number,
        "Dimensions.Length": number
    }
}

export class FormValues {

    search: string;
    material: string;
    range: Record<FormField, { min: number, max: number }>;
    exact: Record<FormField, number>;


    constructor(search: string, material: string, range: Record<FormField, {
        min: number,
        max: number
    }>, exact: Record<FormField, number>) {
        this.search = search;
        this.material = material;
        this.range = range;
        this.exact = exact;
    }

    static zeroOrTruthy(value: any): boolean {
        return value === 0 || value;
    }

    static toFlatObject(formValues: FormValues): any {
        console.log(formValues);

        const result: any = {"Material": formValues.material, "search": formValues.search};

        for (const key in formValues.range) {
            const typedKey = key as FormField;
            const min = formValues.range[typedKey].min;
            const max = formValues.range[typedKey].max;

            if (FormValues.zeroOrTruthy(min) && FormValues.zeroOrTruthy(max)) {
                result[`range_${decodeField(key)}`] = `${min}-${max}`;
            }
        }

        for (const key in formValues.exact) {
            const typedKey = key as FormField;
            const value = formValues.exact[typedKey];

            if (FormValues.zeroOrTruthy(value)) {
                result[decodeField(key)] = formValues.exact[typedKey];
            }
        }

        return result;
    }
}

function InputAndRangeSelector({register, rangeControl, formField, label, valueAsNumber}: {
    register: any,
    rangeControl: any,
    formField: FormField,
    label: string,
    valueAsNumber: boolean
}) {
    const [useRange, setUseRange] = useState(false);

    return (
        <Box className="exact-and-range-selector">
            {useRange ?
                <Controller
                    name={`range.${encodeField(formField)}`}
                    control={rangeControl} // connect Controller to the form
                    defaultValue={[0, 10]} // set initial value
                    render={({field}) => (
                        <Slider
                            {...field} // apply all the necessary form props to Slider
                            // value={field.value || [0, 100]}
                            onChange={(_, newValue) => field.onChange(newValue)}
                            valueLabelDisplay="on"
                            min={0}
                            max={100}
                        />
                    )}
                />
                :
                <TextField {...register(`exact.${encodeField(formField)}]`, {valueAsNumber: valueAsNumber})}
                    // onChange={handleRangeChange}
                           type="number"
                           label={label}
                           variant="outlined"/>
            }

            <FormControlLabel control={<Switch defaultChecked onChange={() => setUseRange(!useRange)}/>}
                              label="Exact/Range"/>
        </Box>
    )
        ;
}

export default function SearchFilter({
                                         handleFilterSubmitToParent
                                     }: {
    handleFilterSubmitToParent: (formValues: FormValues) => void
}) {
    const {register, handleSubmit, control} = useForm<FormValues>({
        defaultValues: {
            search: "",
            material: ""
        }
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        handleFilterSubmitToParent(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className={"search-filter"}>
            <TextField {...register("search")} label="Search" variant="outlined" size="small"/>

            <TextField {...register("material")} label="Material" variant="outlined"/>

            {/*<InputAndRangeSelector register={register} formField="Dimensions.Height" valueAsNumber={true}*/}
            {/*                       label="Height"/>*/}

            {/*<InputAndRangeSelector register={register} formField="Dimensions.Width" valueAsNumber={true}*/}
            {/*                       label="Width"/>*/}

            {/*<InputAndRangeSelector register={register} formField="Dimensions.Length" valueAsNumber={true}*/}
            {/*                       label="Length"/>*/}

            <InputAndRangeSelector register={register} rangeControl = {control} formField="demofield" valueAsNumber={true} label="demo"/>

            <Button type="submit" variant="contained">Search</Button>
        </Box>
    );
}
