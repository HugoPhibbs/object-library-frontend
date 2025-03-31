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
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    MenuItem
} from "@mui/material";
import {useState} from "react";

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {UnitsToString} from "@/utils";
import {encodeField, FormValues} from "@/app/home/FormValues";

export type FormField =
    "search"
    | "name"
    | "material"
    | "Dimensions.Height"
    | "Dimensions.Width"
    | "Dimensions.Length"
    | string;

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

// Attribute groups where you input a range or exact value. Correspond to IFC property sets
const inputAttributeGroups: Record<string, AttributeGroupMetadata> = {
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

function ExactSelector({control, formField, attributeData, labelOverride = "Value"}: {
    control: any
    formField: FormField,
    attributeData: AttributeMetadata,
    labelOverride?: string
}) {
    return (<ControllableTextField name={`exact.${encodeField(formField)}`} control={control}
                                   attributeData={attributeData} labelOverride={labelOverride}/>
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
                <Box className="range-selector">
                    <ExactSelector control={control} formField={`${formField}.val`} attributeData={attributeData}/>
                    <ExactSelector control={control} formField={`${formField}.tol`} attributeData={attributeData}
                                   labelOverride={"(%) Tol"}/>
                </Box>
            }

            <FormControlLabel control={<Switch className="input-range-switch" defaultChecked
                                               onChange={() => setUseRangeOrExact(!useRangeOrExact)}/>}
                              label="Exact/Range"/>
        </>
    )
}

function AttributeInputSelector({control, formField, attributeData}: {
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
    );
}

function AttributeGroupInputFilters({control, attributeGroupId}: {
    control: any,
    attributeGroupId: string
}) {
    const attributeGroup = inputAttributeGroups[attributeGroupId];
    const attributes = attributeGroup.attributes;

    return (
        <CollapsibleFormGroup formGroupLabel={attributeGroup.label}>
            <AttributeGroupInputSelectors attributes={attributes} attributeGroupId={attributeGroupId}
                                          formControl={control}/>
        </CollapsibleFormGroup>
    )
}


function AttributeGroupInputSelectors({attributes, attributeGroupId, formControl}: {
    attributes: AttributeMetadata[],
    attributeGroupId: string,
    formControl: any
}) {
    return (
        <Box className="input-attributes-group">
            {attributes.map((attribute, index) => {
                const field = `${attributeGroupId}.${attribute.id}` as FormField;

                return <AttributeInputSelector key={index}
                                               control={formControl}
                                               formField={field}
                                               attributeData={attribute}
                />
            })}
        </Box>
    )
}

function CollapsibleFormGroup({formGroupLabel, children}: {
    formGroupLabel: string,
    children?: any
}) {
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(!open);
    }

    return (
        <Box className="outline-box">
            <FormControl>
                <FormLabel className="input-attributes-group-label">
                    <Box display="flex" alignItems="center">

                        <Button startIcon={open ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>} onClick={handleToggle}
                                className={"collapsible-form-group-toggle-button"}>
                            {formGroupLabel}
                        </Button>
                    </Box>
                </FormLabel>

                <Collapse in={open}>
                    {children}
                </Collapse>
            </FormControl>
        </Box>
    )
}

function ControllableTextField(
    {
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

function BooleanFilter({control, formLabel, formField, onAfterChangeCallback}: {
    control: any,
    formLabel: string,
    formField: string,
    onAfterChangeCallback?: (e: any, newVal: any) => void
}) {
    // onAfterChangeCallback called after onChange. Used to update other form elements
    return (
        <Controller
            defaultValue={null}
            name={`boolean.${formField}`}
            control={control}
            shouldUnregister={true}
            render={({field}) => (
                <Box display="flex" alignItems="center" gap={"1em"} className={"outline-box"} width={"12em"}>
                    <Typography>{formLabel}</Typography>
                    <ToggleButtonGroup value={field.value} exclusive onChange={(e, newValue) => {
                        field.onChange(field.value === newValue ? null : newValue);
                        onAfterChangeCallback?.(e, newValue);
                    }}
                    >
                        <ToggleButton value={1} sx={{textTransform: "none"}}>Yes</ToggleButton>
                        <ToggleButton value={0} sx={{textTransform: "none"}}>No</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            )}
        />
    );
}

function DropdownFilter({control, formLabel, formField, options, filterType = "match", disabled}: {
    control: any,
    formLabel: string,
    formField: string,
    options: string[],
    filterType: string,
    disabled?: boolean
}) {
    return (
        <Controller
            defaultValue=""
            name={`${filterType}.${encodeField(formField)}`}
            control={control}
            shouldUnregister={true}
            disabled={disabled ?? false}
            render={({field}) => (
                <FormControl>
                    <Box flexDirection={"row"} display={"flex"} gap={"1em"} alignItems={"center"}>
                        <FormLabel>{formLabel}</FormLabel>
                        <TextField select {...field}>
                            {options.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>

                    </Box>
                </FormControl>
            )}
        />
    );
}

//
// ts-expect-error TS71007
export default function SearchFilter({handleFilterSubmitToParent}: {
    handleFilterSubmitToParent: (formValues: FormValues) => void
}) {
    const {handleSubmit, reset, control} = useForm<FormValues>({
        defaultValues: {
            search: undefined,
        }
    });

    const [conditionDropdownVisible, setConditionDropdownVisible] = useState(false);

    const handleIsRecycledChange = (_: any, newIsRecycled: any) => {
        setConditionDropdownVisible(newIsRecycled);
    }

    const objectConditionOptions = ["Good", "Fair", "Poor", "Excellent", "Critical"];

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

            <ControllableTextField name={"match.should.search"} control={control} attributeData={primaryFilters.search}
                                   className={"large-input-text-field"} fieldType={"text"}/>

            <ControllableTextField name={"match.should.name"} control={control} attributeData={primaryFilters.name}
                                   className={"large-input-text-field"} fieldType={"text"}/>

            <ControllableTextField name={"match.should.material"} control={control} attributeData={primaryFilters.material}
                                   className={"large-input-text-field"} fieldType={"text"}/>

            {Object.entries(inputAttributeGroups).map(([attributeGroupId, _]) => (
                <AttributeGroupInputFilters key={attributeGroupId} control={control}
                                            attributeGroupId={attributeGroupId}/>
            ))}

            <CollapsibleFormGroup formGroupLabel={"Recycle Information"}>
                <Box display={"flex"} gap={"1em"} flexDirection={"row"}>
                    <BooleanFilter control={control} formLabel={"Is Recycled"} formField={"is_recycled"}
                                   onAfterChangeCallback={handleIsRecycledChange}/>

                    <Box className={"outline-box"} display={"flex"} alignItems={"center"} gap={"1em"}
                         flexDirection={"row"} visibility={conditionDropdownVisible ? "visible" : "hidden"}>
                        <DropdownFilter control={control} formLabel={"Condition"}
                                        formField={"Pset_Condition.AssessmentCondition"}
                                        options={objectConditionOptions}
                                        filterType={"match.must"}
                                        />
                                        {/*disabled={!conditionDropdownVisible}/>*/}
                    </Box>
                </Box>
            </CollapsibleFormGroup>

            <Button type="submit" variant="contained">Search</Button>
        </Box>
    );
}
