"use client";

import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {
    Box,
    Button,
    Collapse,
    FormControl,
    FormControlLabel,
    FormLabel,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {UnitsToString} from "@/utils";

type FormField =
    "search"
    | "name"
    | "material"
    | "Dimensions.Height"
    | "Dimensions.Width"
    | "Dimensions.Length";

type AttributeMetadata = {
    id: string,
    label: string,
    useRange: boolean
    fieldType?: string
    units?: UnitsToString
}

type AttributeGroupMetadata = {
    label: string,
    attributes: AttributeMetadata[]
}

const primaryFilters: Record<string, AttributeMetadata> = {
    "search": {
        id: "search",
        label: "Search",
        fieldType: "text",
        useRange: false
    },
    "name": {
        id: "name",
        label: "Name",
        fieldType: "text",
        useRange: false
    },
    "material": {
        id: "material",
        label: "Material",
        fieldType: "text",
        useRange: false
    }
}

const attributeGroups: Record<string, AttributeGroupMetadata> = {
    "Dimensions": {
        label: "Dimensions",
        attributes: [
            {id: "Height", label: "Height", useRange: true, units: UnitsToString.LENGTH},
            {id: "Width", label: "Width", useRange: true, units: UnitsToString.LENGTH},
            {id: "Length", label: "Length", useRange: true, units: UnitsToString.LENGTH},
            {id: "Flange Thickness", label: "Flange Thickness", useRange: true, units: UnitsToString.LENGTH},
            {id: "Web Thickness", label: "Web Thickness", useRange: true, units: UnitsToString.LENGTH},
        ]
    },
    "Pset_EnvironmentalImpactIndicators": {
        label: "Environmental Impact",
        attributes: [
            {
                id: "ExpectedServiceLife",
                label: "Expected Service Life",
                useRange: true,
                units: UnitsToString.TIME_YEARS
            },
            {id: "WaterConsumptionPerUnit", label: "Water Consumption", useRange: true, units: UnitsToString.VOLUME},
            {id: "ClimateChangePerUnit", label: "eCO2 emissions", useRange: true, units: UnitsToString.WEIGHT},
            {
                id: "RenewableEnergyConsumptionPerUnit",
                label: "Renewable Energy Consumption",
                useRange: true,
                units: UnitsToString.ELECTRIC_ENERGY
            },
            {
                id: "NonRenewableEnergyConsumptionPerUnit",
                label: "Non-Renewable Energy Consumption",
                useRange: true,
                units: UnitsToString.ELECTRIC_ENERGY
            },
        ]
    },
    "Structural Analysis": {
        label: "Structural Analysis",
        attributes: [
            {id: "Form Factor", label: "Form Factor", useRange: false},
            {
                id: "Elastic Modulus strong axis",
                label: "Elastic Modulus Strong Axis",
                useRange: true,
                units: UnitsToString.MODULUS
            },
            {
                id: "Tensile Strength",
                label: "Tensile Strength",
                useRange: true,
                units: UnitsToString.TENSILE_STRENGTH
            },
            {
                id: "Warping Constant",
                label: "Warping Constant",
                useRange: true,
                units: UnitsToString.WARPING_CONSTANT
            },
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

    search?: string;
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

function ExactSelector({control, formField, attributeData, labelOverride = "Value"}: {
    control: any
    formField: FormField,
    attributeData: AttributeMetadata,
    labelOverride?: string
}) {
    return (
        <Box className="exact-selector">
            <ControllableTextField name={`exact.${encodeField(formField)}`} control={control}
                                   attributeData={attributeData} labelOverride={labelOverride}/>
        </Box>
    )
}

function ExactAndRangeSelector({control, formField, attributeData}: {
    control: any,
    formField: FormField,
    attributeData: AttributeMetadata
}) {
    const [useRangeOrExact, setUseRangeOrExact] = useState(false);

    return (
        <>
            {useRangeOrExact ?
                <Box className="range-selector">
                    <ControllableTextField name={`range.${encodeField(formField)}.min`} control={control}
                                           attributeData={attributeData} labelOverride={"Min"}/>

                    <ControllableTextField name={`range.${encodeField(formField)}.max`} control={control}
                                           attributeData={attributeData} labelOverride={"Max"}/>
                </Box>
                :
                <ExactSelector control={control} formField={formField} attributeData={attributeData}/>}

            <FormControlLabel control={<Switch className="input-range-switch" defaultChecked
                                               onChange={() => setUseRangeOrExact(!useRangeOrExact)}/>}
                              label="Exact/Range"/>
        </>
    )
}

function InputSelector({control, formField, attributeData}: {
    control: any
    formField: FormField,
    attributeData: AttributeMetadata
}) {

    return (
        <Box className="input-selector">
            <FormControl component="fieldset">
                <Box className="input-selector-form">
                    <FormLabel component="legend" className="input-and-range-label">
                        {`${attributeData.units ? `${attributeData.label} (${attributeData.units})` : attributeData.label}:`}
                    </FormLabel>

                    {attributeData.useRange ?
                        <ExactAndRangeSelector control={control} formField={formField} attributeData={attributeData}/> :
                        <ExactSelector control={control} formField={formField} attributeData={attributeData}/>
                    }
                </Box>
            </FormControl>
        </Box>
    )
        ;
}

function AttributeGroupFilters({register, control, attribute_group_id}: {
    register: any,
    control: any,
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
                                className={"attribute-group-label-button"}>
                            {attributeGroup.label}
                        </Button>
                    </Box>
                </FormLabel>

                <Collapse in={open}>
                    <Box className="input-attributes-group">
                        {attributes.map((attribute, index) => {
                            const field = `${attribute_group_id}.${attribute.id}` as FormField;

                            return <InputSelector key={index}
                                                  control={control}
                                                  formField={field}
                                                  attributeData={attribute}
                            />
                        })}
                    </Box>
                </Collapse>

            </FormControl>
        </Box>
    )
}

function ControllableTextField({
                                   name,
                                   control,
                                   attributeData,
                                   fieldType = "number",
                                   className = "small-input-text-field",
                                   labelOverride,
                               }: {
    name: string,
    control: any,
    attributeData: AttributeMetadata,
    fieldType?: string
    className?: string
    labelOverride?: string
}) {
    return (
        <Controller
            defaultValue=""
            name={name}
            control={control}
            shouldUnregister={true}
            render={({field}) => (
                <TextField {...field}
                           label={labelOverride ? labelOverride : attributeData.label}
                           type={fieldType}
                           className={className}
                           slotProps={{
                               "htmlInput": {
                                   "min": 0
                               }
                           }}
                />
            )}
        />
    );
}

export default function SearchFilter({handleFilterSubmitToParent}: {
    handleFilterSubmitToParent: (formValues: FormValues) => void
}) {
    const {register, handleSubmit, reset, watch, control} = useForm<FormValues>({
        defaultValues: {
            search: undefined,
        }
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        handleFilterSubmitToParent(data);
    };

    const handleReset = () => {
        reset();
    }

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} id={"search-filter"}>

            <Box id={"search-filter-header"}>
                <Typography variant="h2" id={"search-filter-title"}>
                    Search and Filter
                </Typography>

                <Button type="button" onClick={handleReset} variant="outlined" color="error">Reset</Button>
            </Box>

            <ControllableTextField name={"match.search"} control={control} attributeData={primaryFilters.search}
                                   className={"large-input-text-field"} fieldType={"text"}/>

            <ControllableTextField name={"match.name"} control={control} attributeData={primaryFilters.name}
                                   className={"large-input-text-field"} fieldType={"text"}/>

            <ControllableTextField name={"match.material"} control={control} attributeData={primaryFilters.material}
                                   className={"large-input-text-field"} fieldType={"text"}/>

            {Object.entries(attributeGroups).map(([attribute_group_id, _]) => (
                <AttributeGroupFilters key={attribute_group_id} register={register} control={control}
                                       attribute_group_id={attribute_group_id}/>
            ))}

            <Button type="submit" variant="contained">Search</Button>
        </Box>
    );
}
