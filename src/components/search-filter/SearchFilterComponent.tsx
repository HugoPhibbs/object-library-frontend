"use client";

import api from "../../api";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {
    TextField,
    Button,
    Box,
    Switch,
    FormControlLabel,
    Slider,
    FormControl,
    FormLabel,
    Collapse, IconButton
} from "@mui/material";
import {useState} from "react";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

type FormField =
    "search"
    | "name"
    | "material"
    | "Dimensions.Height"
    | "Dimensions.Width"
    | "Dimensions.Length";

type AttributeData = {
    id: string,
    label: string,
    useRange: boolean
}

type AttributeGroupData = {
    label: string,
    attributes: AttributeData[]
}

const attributeGroups: Record<string, AttributeGroupData> = {
    "Dimensions": {
        label: "Dimensions",
        attributes: [
            {id: "Height", label: "Height", useRange: true},
            {id: "Width", label: "Width", useRange: true},
            {id: "Length", label: "Length", useRange: true},
            {id: "Flange Thickness", label: "Flange Thickness", useRange: true},
            {id: "Web Thickness", label: "Web Thickness", useRange: true},
        ]
    },
    "Pset_EnvironmentalImpactIndicators": {
        label: "Environmental Impact",
        attributes: [
            {id: "ExpectedServiceLife", label: "Expected Service Life", useRange: true},
            {id: "WaterConsumptionPerUnit", label: "Water Consumption", useRange: true},
            {id: "ClimateChangePerUnit", label: "eCO2 emissions", useRange: true},
            {id: "RenewableEnergyConsumptionPerUnit", label: "Renewable Energy Consumption", useRange: true},
            {id: "NonRenewableEnergyConsumptionPerUnit", label: "Non-Renewable Energy Consumption", useRange: true}
        ]
    },
    "Structural Analysis": {
        label: "Structural Analysis",
        attributes: [
            {id: "Form Factor", label: "Form Factor", useRange: false},
            {id: "Elastic Modulus strong axis", label: "Elastic Modulus Strong Axis", useRange: true},
            {id: "Tensile Strength", label: "Tensile Strength", useRange: true},
            {id: "Warping Constant", label: "Warping Constant", useRange: true},
        ]
    }
}

function encodeField(field: FormField): string {
    return field.replace(".", "%2E");
}

function decodeField(field: string): FormField {
    return field.replace("%2E", ".") as FormField;
}

export class FormValues {

    search: string;
    range: Record<FormField, { min: number, max: number }>;
    exact: Record<FormField, number>;
    match: Record<FormField, string>;


    constructor(search: string,
                range: Record<FormField, { min: number, max: number }>,
                exact: Record<FormField, number>,
                match: Record<FormField, string>) {
        this.search = search;
        this.range = range;
        this.exact = exact;
        this.match = match;
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

function RangeSelector({register, formField, valueAsNumber}: {
    register: any,
    formField: FormField,
    valueAsNumber: boolean
}) {
    return (
        <Box className="range-selector">
            <TextField {...register(`range.${encodeField(formField)}.min`, {valueAsNumber: valueAsNumber})}
                       type="number"
                       label="Min"
                       variant="outlined"
                       className="input-text-field"/>

            <TextField {...register(`range.${encodeField(formField)}.max`, {valueAsNumber: valueAsNumber})}
                       type="number"
                       label="Max"
                       variant="outlined"
                       className="input-text-field"/>
        </Box>
    )
}

function ExactSelector({register, formField, valueAsNumber, label}: {
    register: any,
    formField: FormField,
    valueAsNumber: boolean,
    label: string
}) {
    return (
        <Box className="exact-selector">
            <TextField {...register(`exact.${encodeField(formField)}]`, {valueAsNumber: valueAsNumber})}
                // onChange={handleRangeChange}
                       type="number"
                       label={label}
                       variant="outlined"
                       className="input-text-field"
            />
        </Box>
    )
}

function ExactAndRangeSelector({register, formField, label, valueAsNumber}: {
    register: any,
    formField: FormField,
    label: string,
    valueAsNumber: boolean
}) {
    const [useRangeOrExact, setUseRangeOrExact] = useState(false);

    return (
        <>
            {useRangeOrExact ?
                <RangeSelector register={register} formField={formField}
                               valueAsNumber={valueAsNumber}/>
                :
                <ExactSelector label={label} register={register} formField={formField}
                               valueAsNumber={valueAsNumber}/>}

            <FormControlLabel control={<Switch className="input-range-switch" defaultChecked
                                               onChange={() => setUseRangeOrExact(!useRangeOrExact)}/>}
                              label="Exact/Range"/>
        </>
    )
}

function InputSelector({register, formField, label, valueAsNumber, useRange}: {
    register: any,
    formField: FormField,
    label: string,
    valueAsNumber: boolean,
    useRange: boolean
}) {

    return (
        <Box className="input-selector">
            <FormControl component="fieldset">
                <Box className="input-selector-form">
                    <FormLabel component="legend" className="input-and-range-label">
                        {`${label}:`}
                    </FormLabel>

                    {useRange ?
                        <ExactAndRangeSelector register={register} formField={formField}
                                               label={label} valueAsNumber={valueAsNumber}/> :
                        <ExactSelector label={label} register={register} formField={formField}
                                       valueAsNumber={valueAsNumber}/>
                    }
                </Box>
            </FormControl>
        </Box>
    )
        ;
}

function AttributeGroupFilters({register, attribute_group_id}: {
    register: any,
    attribute_group_id: string
}) {
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!open);
    }

    const attributeGroup = attributeGroups[attribute_group_id];
    const attributes = attributeGroup.attributes;

    return (
        <Box className="outline-box">
            <FormControl>
                {/*<FormLabel className="input-attributes-group-label">{attributeGroup.label}</FormLabel>*/}

                <FormLabel className="input-attributes-group-label">
                    <Box display="flex" alignItems="center">

                        <Button startIcon={open ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>} onClick={handleToggle}
                                sx={{
                                    textTransform: 'none',
                                    color: 'inherit', // Inheri
                                    fontWeight: 'normal',
                                    // padding: "1rem"
                                }}>
                            {attributeGroup.label}
                        </Button>
                    </Box>
                </FormLabel>

                <Collapse in={open}>
                    <Box className="input-attributes-group">
                        {attributes.map((attribute) => {
                            const field = `${attribute_group_id}.${attribute.id}` as FormField;

                            return <InputSelector key={field} register={register} formField={field}
                                                  valueAsNumber={true}
                                                  label={attribute.label}
                                                  useRange={attribute.useRange}/>
                        })}
                    </Box>
                </Collapse>

            </FormControl>
        </Box>
    )
}

export default function SearchFilter({
                                         handleFilterSubmitToParent
                                     }: {
    handleFilterSubmitToParent: (formValues: FormValues) => void
}) {
    const {register, handleSubmit} = useForm<FormValues>({
        defaultValues: {
            search: ""
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

            <TextField {...register("search")} label="Search" variant="outlined"/>

            <TextField {...register("match.name")} label="Name" variant="outlined"/>

            <TextField {...register("match.material")} label="Material" variant="outlined"/>

            <AttributeGroupFilters register={register} attribute_group_id="Dimensions"/>

            <AttributeGroupFilters register={register} attribute_group_id="Pset_EnvironmentalImpactIndicators"/>

            <AttributeGroupFilters register={register} attribute_group_id="Structural Analysis"/>

            <Button type="submit" variant="contained">Search</Button>
        </Box>
    );
}
