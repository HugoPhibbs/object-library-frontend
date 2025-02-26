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
import {FilteredLibraryResult, LibraryConnectionData} from "@/utils";

const connectionAttributesMetaData: Record<string, Record<string, string | boolean>> = {
    connection_type: {label: "Connection Type"},
    id: {label: "ID", exclude: true},
    mass: {label: "Mass"},
    moment: {label: "Moment"},
    shear: {label: "Shear"},
    section: {label: "Section"},
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

const flattenObject = (obj: Record<string, any>, prefix = ""): Record<string, any> => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "object" && value !== null) {
            Object.assign(acc, flattenObject(value, newKey));
        } else {
            // @ts-ignore
            acc[newKey] = value;
        }
        return acc;
    }, {});
};

function ConnectionTable({connectionData}: { connectionData: FilteredLibraryResult<LibraryConnectionData> }) {
    if (!connectionData?.data) return null;

    const renderRow = (key: string, value: any, level = 0) => {
        if (typeof value === "object" && value !== null) {
            return (
                <Fragment key={key}>
                    <TableRow sx={{backgroundColor: level === 0 ? "#ddd" : "#eee"}}>
                        <TableCell colSpan={2} sx={{fontWeight: "bold"}}>
                            {connectionAttributesMetaData[key].label}
                        </TableCell>
                    </TableRow>
                    {Object.entries(value).map(([subKey, subValue]): any => renderRow(subKey, subValue, level + 1))}
                </Fragment>
            );
        }
        return (
            !connectionAttributesMetaData[key].exclude ? (
                <TableRow key={key}>
                    <TableCell sx={{pl: level * 2 + 1}}>{connectionAttributesMetaData[key].label}</TableCell>
                    <TableCell>{value}</TableCell>
                </TableRow>
            ) : null
        );
    };

    return (
        <Box>
            <Typography variant="h3">Connection Data</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                        {Object.entries(connectionData.data).map(([key, value]) => renderRow(key, value))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function ConnectionsSearchForm({onSubmit, register, control, sectionTypes,}: {
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>,
    register: any,
    sectionTypes: string[],
    control: any
}) {

    return (
        <Box className={"outline-box"} id={"connections-form-box"} component={"form"} onSubmit={onSubmit}>
            <Box>
                <Typography variant={"h2"}>Enter Details</Typography>
            </Box>

            <FormControl>
                <InputLabel id="connection-type-select-label">Connection Type</InputLabel>

                <Controller
                    name="connectionType"
                    control={control}
                    render={({field}) => (
                        <Select labelId="connection-type-select-label" {...field}
                                id="connection-type-select" type="text" label="Connection Type" required>
                            <MenuItem value="mep-8">MEP-8</MenuItem>
                        </Select>
                    )}
                />
            </FormControl>

            <FormControl>
                <InputLabel id={"member-type-select-label"}>Member Type</InputLabel>
                <Controller control={control} name={"memberSection"} render={({field}) => (
                    <Select labelId={"member-type-select-label"} {...field}
                            id={"member-type-select"} type="text" label={"Member Type"} required>
                        {sectionTypes.map((sectionType, index) => (
                            <MenuItem key={index} value={sectionType}>{sectionType}</MenuItem>
                        ))}
                    </Select>
                )}/>
            </FormControl>

            <TextField label="Member Mass/Length (kg/m)" {...register("memberMass")} type="number"
                       slotProps={{htmlInput: {step: "0.1", min: 0}}} required/>

            <FormControl>
                <InputLabel id={"moment-shear-ratio-label"}>Moment/Shear Ratio (%)</InputLabel>

                <Controller
                    name="momentShearRatio"
                    control={control}
                    render={({field}) => (
                        <Select labelId={"moment-shear-ratio-label"} {...field}
                                id={"moment-shear-ratio"} type="text" label={"Moment/Shear Ratio (%)"} required>
                            <MenuItem value={"50/25"}>50/25</MenuItem>
                            <MenuItem value={"70/35"}>70/35</MenuItem>
                            <MenuItem value={"100/50"}>100/50</MenuItem>
                        </Select>
                    )}
                />
            </FormControl>

            <Button type={"submit"} variant={"contained"}>Find Connection</Button>
        </Box>
    );
}

export default function Connections() {
    const {register, handleSubmit, control} = useForm({
        defaultValues: {memberSection: "", connectionType: "", momentShearRatio: ""}
    });
    const [filteredConnections, setFilteredConnections] = React.useState<FilteredLibraryResult<LibraryConnectionData>[]>([]);

    const [sectionTypes, setSectionTypes] = React.useState([]);

    useEffect(() => {
        api.get("/connection/section-type")
            .then((response) => setSectionTypes(response.data.sort()))
            .catch((error) => console.error("Failed to get section types: ", error));
    }, []);


    const onSubmit = (data: any) => {
        const momentShearRatio = data.momentShearRatio;
        // Split the moment shear ratio into two numbers
        const [moment, shear] = momentShearRatio.split("/");

        api.get(`/connection/filter`, {
            params: {
                moment: moment,
                shear: shear,
                match_section: data.memberSection,
                mass: data.memberMass
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