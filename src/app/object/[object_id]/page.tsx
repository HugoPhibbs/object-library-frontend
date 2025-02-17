"use client"

import {useParams} from "next/navigation";
import {Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Grid from "@mui/material/Grid2"
import SearchObjects from "@/components/search-filter/SearchAndResultsComponent";
import Image from "next/image";
import React, {useEffect} from "react";
import {DownloadTableCell, IfcDownloadTableCell, ObjectImage} from "@/components/common"
import api from "@/api";

import _ from 'lodash';
import {grey} from "@mui/material/colors";
import {booleanToYesNo} from "@/utils";
import DownloadIcon from "@mui/icons-material/Download";

const mainDescriptionTableAttributes = [
    {label: "ID", object_path: "_id"},
    {label: "IFC Type", object_path: "_source.ifc_type"},
    {label: "Material", object_path: "_source.material"},
    {label: "Load Bearing", object_path: "_source.property_sets.Pset_BeamCommon.LoadBearing.value", isBoolean: true},
    {label: "Form Factor", object_path: "_source.property_sets[\"Structural Analysis\"][\"Form Factor\"].value"},
]

function MainDescriptionTable({currObject}: { currObject: object }) {
    return (
        <Box>
            <h2>
                Main Attributes
            </h2>

            <TableContainer>
                <Table className={"data-table"}>
                    <TableHead>
                        <TableRow>
                            <TableCell className={"table-column-header-cell"}>Attribute</TableCell>
                            <TableCell className={"table-column-header-cell"}>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mainDescriptionTableAttributes.map((attribute, index) => {
                                const value = _.get(currObject, attribute.object_path);
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{attribute.label}</TableCell>
                                        <TableCell>{attribute.isBoolean ? booleanToYesNo(value) : value}</TableCell>
                                    </TableRow>
                                )
                            }
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

function ObjectFilesTable({currObject}: { currObject: any }) {
    return (
        <Box>
            <h2>
                Object Files
            </h2>

            <TableContainer>
                <Table className={"data-table"}>
                    <TableHead>
                        <TableRow>
                            <TableCell className={"table-column-header-cell"}>File Name</TableCell>
                            <TableCell className={"table-column-header-cell"}>Download</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                IFC File
                            </TableCell>

                            <IfcDownloadTableCell object_id={currObject?._id}/>
                        </TableRow>

                        <TableRow>
                            <TableCell>
                                Inspection Records
                            </TableCell>

                            <DownloadTableCell object_id={currObject?._id} handleDownload={(id: any) => null}
                                               label={"PDF"}/>
                        </TableRow>

                        <TableRow>
                            <TableCell>
                                Manufacturer&#39;s Booklet
                            </TableCell>

                            <DownloadTableCell object_id={currObject?._id} handleDownload={(id: any) => null}
                                               label={"PDF"}/>
                        </TableRow>

                        <TableRow>
                            <TableCell>
                                Environmental Impact Assessment
                            </TableCell>

                            <DownloadTableCell object_id={currObject?._id} handleDownload={(id: any) => null}
                                               label={"PDF"}/>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default function ViewObject() {
    const [currObject, setCurrObject] = React.useState<any>(null);

    const {object_id} = useParams<{ object_id: string }>();

    useEffect(() => {
        api.get(`/object/${object_id}`)
            .then((response) => setCurrObject(response.data))
            .catch((error) => console.error("Failed to get objects: ", error));
    }, [object_id])


    return (
        <Box p={3}>
            <Box className={"title-box"}>
                <h1 className={"title"}>Object Library</h1>
            </Box>

            <Box className={"content"}>
                <Grid container spacing={2} sx={{height: "60rem", width: "80rem"}}>
                    <Grid size={4} className={"outline-box"}>
                        <ObjectImage object_id={object_id} width={500} height={500}/>
                    </Grid>

                    <Grid size={8} className={"main-description-box outline-box"}>
                        <h2 className={"sub-title"}>{currObject?._source.name}</h2>
                        <MainDescriptionTable currObject={currObject}/>
                        <ObjectFilesTable currObject={currObject}/>
                    </Grid>

                    <Grid size={12} className={"outline-box"}>
                        <div style={{backgroundColor: 'lightgreen', height: '100%'}}>Item 3 (100%)</div>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}