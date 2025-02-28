"use client"

import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import api from "@/api";
import React, {Fragment, useEffect} from "react";
import {FilteredLibraryResult, flattenObject, LibraryConnectionData} from "@/utils";
import {SelectConnectionType, SelectMomentShearRatio} from "@/components/common";
import {useSearchParams} from "next/navigation";
import {fontWeight} from "@mui/system";

type AttributeMetaData = {
    label: string,
    exclude?: boolean
}

const connectionAttributesMetaData: Record<string, AttributeMetaData> = {
    connection_type: {label: "Connection Type", exclude: true},
    id: {label: "ID", exclude: true},
    mass_per_length: {label: "Mass/Length", exclude: true},
    moment: {label: "Moment", exclude: true},
    shear: {label: "Shear", exclude: true},
    section_type: {label: "Section", exclude: true},
    diameter: {label: "Diameter"},
    total_bottom: {label: "Total Bottom"},
    total_top: {label: "Total Top"},
    length: {label: "Length"},
    thickness: {label: "Thickness"},
    width: {label: "Width"},
    flange: {label: "Flange"},
    web: {label: "Web"},
    moment_bottom: {label: "Moment Bottom"},
    moment_top: {label: "Moment Top"},
    shear_capacity: {label: "Shear"},
    design_capacity: {label: "Design Capacity"},
    fillet_welds: {label: "Fillet Welds"},
    bolts: {label: "Bolts"},
    cleat: {label: "Cleat"},
    connection: {label: "Connection"},
};

function ConnectionTable({connectionData}: { connectionData: FilteredLibraryResult<LibraryConnectionData> }) {
    if (!connectionData?.data) return null;

    const flattenedConnectionData = flattenObject(connectionData.data);

    return (
        <Box id={"connection-table-box"}>
            <Typography variant="h3">Connection Data</Typography>
            <TableContainer component={Paper}>
                <Table sx={{
                    borderCollapse: "collapse",
                    "& td, & th": {border: 1, borderColor: "grey.400"}, // no otherwise neat way to do borders for all cells
                }}>
                    <TableBody>
                        <TableRow>
                            <TableCell align={"center"} colSpan={6}
                                       className={"connection-table-group-cell"}>Connection</TableCell>
                            <TableCell align={"center"} colSpan={2} className={"connection-table-group-cell"}
                                       rowSpan={2}>Design Capacity</TableCell>
                        </TableRow>

                        <TableRow>
                            {["Bolts", "Cleat", "Fillet Welds"].map((label, index) => (
                                <TableCell align={"center"} key={index} colSpan={2}
                                           className={"connection-table-subgroup-cell"}>{label}</TableCell>
                            ))}
                        </TableRow>

                        {[
                            ["width", "total_top", "flange", "moment_top"],
                            ["length", "total_bottom", "web", "moment_bottom"],
                            ["thickness", "diameter", "", "shear"]
                        ].map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {row.map((attribute_name: string, colIndex: number) => {
                                    if (!attribute_name) return <TableCell className={"bg-stripes"} key={colIndex} colSpan={2}></TableCell>

                                    return <React.Fragment key={rowIndex * 3 + colIndex}>
                                        <TableCell
                                            align={"center"}>{connectionAttributesMetaData[attribute_name].label}</TableCell>
                                        <TableCell
                                            align={"center"}>{flattenedConnectionData[attribute_name]}</TableCell>
                                    </React.Fragment>
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function ConnectionsSearchForm({onSubmit, register, control, sectionTypes, defaultValues}: {
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>,
    register: any,
    sectionTypes: string[],
    control: any,
    defaultValues?: Record<string, any>,
}) {

    return (
        <form className={"outline-box"} id={"connections-form-box"} onSubmit={onSubmit}>
            <Box>
                <Typography variant={"h2"}>Enter Details</Typography>
            </Box>

            <SelectConnectionType control={control}/>

            <FormControl>
                <InputLabel id={"member-type-select-label"}>Member Type</InputLabel>
                <Controller control={control} name={"sectionType"} render={({field}) => (
                    <Select labelId={"member-type-select-label"} {...field}
                            id={"member-type-select"} type="text" label={"Member Type"} required>
                        {sectionTypes.map((sectionType, index) => (
                            <MenuItem key={index} value={sectionType}>{sectionType}</MenuItem>
                        ))}
                    </Select>
                )}/>
            </FormControl>

            <TextField label="Member Mass/Length (kg/m)" {...register("massPerLength")} type="number"
                       slotProps={{htmlInput: {step: "0.1", min: 0}}} required/>

            <SelectMomentShearRatio control={control}/>

            <Button type={"submit"} variant={"contained"}>Find Connection</Button>
        </form>
    );
}

export default function Connections() {
    // Get default values from URL search params, if any
    const searchParams = useSearchParams();
    const defaultMassPerLength = searchParams.get("massPerLength") || "";
    const defaultChosenSectionType = searchParams.get("sectionType") || "";

    const defaultValues = {
        sectionType: defaultChosenSectionType,
        massPerLength: defaultMassPerLength,
        momentShearRatio: ""
    };
    if (defaultMassPerLength) defaultValues["massPerLength"] = defaultMassPerLength; // Don't want to an undefined default value

    const {register, handleSubmit, control} = useForm({defaultValues: defaultValues});

    // Now can continue...
    const [filteredConnections, setFilteredConnections] = React.useState<FilteredLibraryResult<LibraryConnectionData>[]>([]);

    const [sectionTypes, setSectionTypes] = React.useState([]);

    useEffect(() => {
        api.get("/connection/unique-values", {params: {field: "section_type"}})
            .then((response) => {
                setSectionTypes(response.data.sort())
                console.log(response.data)
            })
            .catch((error) => console.error("Failed to get section types: ", error));
    }, []);


    // For the form submission
    const onSubmit = (data: any) => {
        const momentShearRatio = data.momentShearRatio;
        // Split the moment shear ratio into two numbers
        const [moment, shear] = momentShearRatio.split("/");

        api.get(`/connection/filter`, {
            params: {
                moment: moment,
                shear: shear,
                match_section_type: data.sectionType,
                mass_per_length: data.massPerLength,
            }
        }).then((response) => {
            const data = response.data;
            console.log(data);
            setFilteredConnections(data);
        }).catch((e) => {
            console.log(e)
        });
    }

    return (
        <Box id={"connections-main-box"}>

            <Box id={"connections-intro-box"}>
                <Typography variant={"h1"}>Find Connection Data</Typography>

                <p>
                    Please enter connection type, member type, member mass, and moment/shear ratio
                </p>
            </Box>


            <Box id={"connections-form-and-results-box"}>
                <ConnectionsSearchForm onSubmit={handleSubmit(onSubmit)} register={register} sectionTypes={sectionTypes}
                                       control={control}/>

                <Box id={"connections-results-box"}>
                    {filteredConnections?.[0] && <ConnectionTable connectionData={filteredConnections[0]}/>}
                </Box>
            </Box>
        </Box>
    )
}