"use client";

import api from "../../api";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {TextField, Button, Box, Switch, FormControlLabel, Slider, FormControl, FormLabel} from "@mui/material";
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

function InputAndRangeSelector({register, formField, label, valueAsNumber}: {
    register: any,
    formField: FormField,
    label: string,
    valueAsNumber: boolean
}) {
    const [useRange, setUseRange] = useState(false);

    return (
        <Box className="exact-and-range-selector">
            <FormControl component="fieldset">
                <Box className="input-and-range-selector">
                    <FormLabel component="legend" className="input-and-range-label">
                        {`${label}:`}
                    </FormLabel>

                    <Box>
                        {useRange ?
                            <Box className="range-selector">
                                <TextField {...register(`range.${encodeField(formField)}.min`, {valueAsNumber: valueAsNumber})}
                                    // onChange={handleRangeChange}
                                           type="number"
                                           label="Min"
                                           variant="outlined"
                                           className="input-text-field"/>

                                <TextField {...register(`range.${encodeField(formField)}.max`, {valueAsNumber: valueAsNumber})}
                                    // onChange={handleRangeChange}
                                           type="number"
                                           label="Max"
                                           variant="outlined"
                                           className="input-text-field"/>
                            </Box>
                            :
                            <Box className="exact-selector">
                                <TextField {...register(`exact.${encodeField(formField)}]`, {valueAsNumber: valueAsNumber})}
                                    // onChange={handleRangeChange}
                                           type="number"
                                           label={label}
                                           variant="outlined"
                                           className="input-text-field"
                                />
                            </Box>
                        }
                    </Box>


                    <FormControlLabel control={<Switch className="input-range-switch" defaultChecked
                                                       onChange={() => setUseRange(!useRange)}/>}
                                      label="Exact/Range"/>
                </Box>


            </FormControl>
        </Box>
    )
        ;
}

function AttributeGroupFilters({register, group_name, attributes}: {
    register: any,
    group_name: string,
    attributes: string[]
}) {

    return (
        <Box className="outline-box">
            <FormControl className="input-attributes-group">
                <FormLabel className="input-attributes-group-label">Dimensions</FormLabel>

                {attributes.map((attribute) => {
                    const field = `${group_name}.${attribute}` as FormField;

                    return <InputAndRangeSelector key={field} register={register} formField={field}
                                                  valueAsNumber={true}
                                                  label={attribute}/>
                })}
                {/*<InputAndRangeSelector register={register} formField="Dimensions.Height" valueAsNumber={true}*/}
                {/*                       label="Height"/>*/}

                {/*<InputAndRangeSelector register={register} formField="Dimensions.Width" valueAsNumber={true}*/}
                {/*                       label="Width"/>*/}

                {/*<InputAndRangeSelector register={register} formField="Dimensions.Length" valueAsNumber={true}*/}
                {/*                       label="Length"/>*/}
            </FormControl>
        </Box>
    )
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
            <h2 className={"search-filter-title"}>
                Search and Filter
            </h2>

            <TextField {...register("search")} label="Search" variant="outlined" size="small"/>

            <TextField {...register("material")} label="Material" variant="outlined"/>

            <AttributeGroupFilters register={register} group_name="Dimensions" attributes={["Height", "Width", "Length"]} />

            <Button type="submit" variant="contained">Search</Button>
        </Box>
    );
}
