"use client"

import {useParams} from "next/navigation";
import {Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2"
import React, {Fragment, useEffect} from "react";
import {DownloadTableCell, IfcDownloadTableCell, ObjectImage} from "@/components/common"
import api from "@/api";

import _ from 'lodash';
import {grey} from "@mui/material/colors";
import {booleanToYesNo, LibraryObject, UnitsToString} from "@/utils";

const mainDescriptionTableAttributes = [
    {label: "ID", object_path: "id"},
    {label: "IFC Type", object_path: "ifc_type"},
    {label: "Manufacturer", object_path: "property_sets.Identity Data.Manufacturer.value"},
    {label: "Material", object_path: "material"},
    {label: "Load Bearing", object_path: "property_sets.Pset_BeamCommon.LoadBearing.value", isBoolean: true}
]

const detailedDescriptionTableAttributes = {
    "Structural": [
        {label: "Section Shape", object_path: "property_sets.Structural.Section Shape.value", units: null},
        {
            label: "Cut Length",
            object_path: "property_sets.Structural.Cut Length.value",
            units: UnitsToString.LENGTH
        },
        {
            label: "Maximum Length",
            object_path: "property_sets.Structural.MaximumLength_ANZRS.value",
            units: UnitsToString.LENGTH
        },
    ],
    "Identity Data": [
        {label: "Assembly Code", object_path: "property_sets.Identity Data.Assembly Code.value", units: null},
        {label: "Model", object_path: "property_sets.Identity Data.Model.value", units: null}
    ],
    "Structural Analysis": [
        {
            label: "Elastic Modulus strong axis",
            object_path: "property_sets.Structural Analysis.Elastic Modulus strong axis.value",
            units: UnitsToString.MODULUS
        },
        {
            label: "Elastic Modulus weak axis",
            object_path: "property_sets.Structural Analysis.Elastic Modulus weak axis.value",
            units: UnitsToString.MODULUS
        },
        {label: "Form Factor", object_path: "property_sets.Structural Analysis.Form Factor.value", units: null},
        {
            label: "Nominal Weight",
            object_path: "property_sets.Structural Analysis.Nominal Weight.value",
            units: UnitsToString.WEIGHT
        },
        {
            label: "Section Area",
            object_path: "property_sets.Structural Analysis.Section Area.value",
            units: UnitsToString.AREA
        },
    ]
};


function TableWithTitle({title, children}: { title: string, children: React.ReactNode }) {
    return (
        <Box className="table-with-title">
            <h2>{title}</h2>
            <TableContainer sx={{width: "auto"}}>
                <Table className={"data-table"}>
                    {children}
                </Table>
            </TableContainer>
        </Box>
    );
}

function MainAttributeTable({currObject}: { currObject: LibraryObject | null }) {
    return (
        <TableWithTitle title="Main Attributes">
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
                    );
                })}

                <TableRow>
                    <TableCell>Is Recycled</TableCell>
                    <TableCell>Yes</TableCell>
                </TableRow>
            </TableBody>
        </TableWithTitle>
    );
}

function DetailedAttributeTable({currObject}: { currObject: LibraryObject | null }) {
    return (
        <TableWithTitle title="Further Attributes">
            <TableBody>
                {Object.entries(detailedDescriptionTableAttributes).map(([groupName, attributes], groupIndex) => (
                    <Fragment key={groupIndex}>
                        <TableRow>
                            <TableCell colSpan={2} style={{backgroundColor: grey[200]}}>
                                {groupName}
                            </TableCell>
                        </TableRow>
                        {attributes.map((attribute, index) => {
                            const value = _.get(currObject, attribute.object_path);
                            return (
                                <TableRow
                                    key={Object.keys(detailedDescriptionTableAttributes).length * groupIndex + index}>
                                    <TableCell>{attribute.label}</TableCell>
                                    <TableCell>
                                        {value} <Typography variant={"inherit"} component="span"
                                                            fontWeight="bold">{attribute.units}</Typography>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </Fragment>
                ))}
            </TableBody>
        </TableWithTitle>
    );
}

function ObjectFilesTable({currObject}: { currObject: LibraryObject | null }) {
    return (
        <TableWithTitle title="Object Files">
            <TableHead>
                <TableRow>
                    <TableCell className={"table-column-header-cell"}>File Name</TableCell>
                    <TableCell className={"table-column-header-cell"}>Download</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>IFC File</TableCell>
                    <IfcDownloadTableCell object_id={currObject?.id}/>
                </TableRow>
                <TableRow>
                    <TableCell>Inspection Records</TableCell>
                    <DownloadTableCell object_id={currObject?.id} handleDownload={(id: any) => null} label={"PDF"}
                                       dropdownOptions={["Nov 24", "Nov 23", "Nov 22"]}/>
                </TableRow>
                <TableRow>
                    <TableCell>Manufacturer&#39;s Booklet</TableCell>
                    <DownloadTableCell object_id={currObject?.id} handleDownload={(id: any) => null} label={"PDF"}/>
                </TableRow>
                <TableRow>
                    <TableCell>Environmental Impact Assessment</TableCell>
                    <DownloadTableCell object_id={currObject?.id} handleDownload={(id: any) => null} label={"PDF"}/>
                </TableRow>
            </TableBody>
        </TableWithTitle>
    )
}

export default function ViewObject() {
    const [currObject, setCurrObject] = React.useState<LibraryObject | null>(null);

    const {object_id} = useParams<{ object_id: string }>();

    useEffect(() => {
        api.get(`/object/${object_id}`)
            .then((response) => setCurrObject(response.data))
            .catch((error) => console.error("Failed to get objects: ", error));
    }, [object_id])


    return (
        <Box className={"content"}>
            <Grid container spacing={2} sx={{height: "60rem", width: "80rem"}}>
                <Grid size={4}>
                    <ObjectImage object_id={object_id} width={500} height={500} imgClassName={"outline-box"}/>
                </Grid>

                <Grid size={8} className={"main-description-box outline-box"}>
                    <h2 className={"sub-title"}>{currObject?.name}</h2>

                    <Box sx={{display: "flex", flexDirection: "row", gap: "1rem", justifyContent: "space-around"}}>
                        <MainAttributeTable currObject={currObject}/>
                        <ObjectFilesTable currObject={currObject}/>
                    </Box>

                </Grid>

                <Grid size={12} className={"outline-box"}>
                    <DetailedAttributeTable currObject={currObject}/>
                </Grid>
            </Grid>
        </Box>
    );
}