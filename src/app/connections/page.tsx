"use client"

import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TableContainer,
    TextField,
    Table,
    TableBody,
    TableRow,
    TableCell
} from "@mui/material";
import {useForm} from "react-hook-form";
import api from "@/api";
import React from "react";


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


const ConnectionTable = ({connectionData}: { connectionData: any }) => {
    if (!connectionData?.data) return null;
    const flattenedData = flattenObject(connectionData.data);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    {Object.entries(flattenedData).map(([key, value]) => (
                        <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


export default function Connections() {
    const {register, handleSubmit} = useForm();
    const [filteredConnections, setFilteredConnections] = React.useState([]);


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

            <h2>
                Find a connection data tool
            </h2>

            <p>
                Please enter connection type, member type, member mass, and moment/shear ratio
            </p>

            <Box id={"connections-form-and-results-box"}>
                <Box id={"connections-form-box"} component={"form"} onSubmit={handleSubmit(onSubmit)}>
                    <FormControl>
                        <InputLabel id="connection-type-select-label">Connection Type</InputLabel>
                        <Select labelId={"connection-type-select-label"} {...register("connectionType")}
                                id="connection-type-select" type="text" label={"Connection Type"} required>
                            <MenuItem value={"mep-8"}>MEP-8</MenuItem>
                        </Select>
                    </FormControl>

                    {/* TextField does not need FormControl or InputLabel */}
                    <TextField label="Member Type" {...register("memberSection")} type="text" required/>

                    {/* Fix: Use correct name for member mass */}
                    <TextField label="Member Mass/Length (kg/m)" {...register("memberMass")} type="number"
                               slotProps={{htmlInput: {step: "0.1"}}} required/>

                    <FormControl>
                        <InputLabel id={"moment-shear-ratio-label"}>Moment/Shear Ratio (%)</InputLabel>
                        <Select labelId={"moment-shear-ratio-label"} autoWidth {...register("momentShearRatio")}
                                id={"moment-shear-ratio"} type="text" label={"Moment/Shear Ratio (%)"} required>
                            <MenuItem value={"50/25"}>50/25</MenuItem>
                            <MenuItem value={"60/40"}>70/35</MenuItem>
                            <MenuItem value={"70/30"}>100/50</MenuItem>
                        </Select>
                    </FormControl>

                    <Button type={"submit"} variant={"contained"}>Find Connection</Button>
                </Box>

                <Box id={"connections-results-box"}>
                    {filteredConnections ?
                        (<><p> Found Connection</p><Box>
                            {filteredConnections?.[0] && <ConnectionTable connectionData={filteredConnections[0]}/>}
                        </Box></>) :
                        null}
                </Box>
            </Box>
        </Box>
    )
}