"use client"

import {useParams} from "next/navigation";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Box, Button, Divider, FormControl, Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import React, {useEffect} from "react";
import {DownloadTableCell, IfcDownloadTableCell, ObjectImage} from "@/components/common"
import api from "@/api";

import _ from 'lodash';
import {booleanToYesNo, LibraryObjectData, UnitsToString} from "@/utils";
import {useForm} from "react-hook-form";
import Link from "next/link";
import {saveAs} from "file-saver";

const mainDescriptionTableAttributes = [
    {label: "ID", object_path: "id"},
    {label: "IFC Type", object_path: "ifc_type"},
    {label: "Manufacturer", object_path: "property_sets.Identity Data.Manufacturer.value"},
    {label: "Material", object_path: "material"},
    {label: "Load Bearing", object_path: "property_sets.Pset_BeamCommon.LoadBearing.value", isBoolean: true}
]

type DetailedAttribute = {
    label: string,
    object_path: string,
    units: string | null
}

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
    ],
    "Environmental Impact": [
        {
            label: "Expected Service Life",
            object_path: "property_sets.Pset_EnvironmentalImpactIndicators.ExpectedServiceLife.value",
            units: UnitsToString.TIME_YEARS
        },
        {
            label: "Water Consumption",
            object_path: "property_sets.Pset_EnvironmentalImpactIndicators.WaterConsumptionPerUnit.value",
            units: UnitsToString.VOLUME
        },
        {
            label: "eCO2 emissions",
            object_path: "property_sets.Pset_EnvironmentalImpactIndicators.ClimateChangePerUnit.value",
            units: UnitsToString.WEIGHT
        },
        {
            label: "Renewable Energy Consumption",
            object_path: "property_sets.Pset_EnvironmentalImpactIndicators.RenewableEnergyConsumptionPerUnit.value",
            units: UnitsToString.ELECTRIC_ENERGY
        },
        {
            label: "Non-Renewable Energy Consumption",
            object_path: "property_sets.Pset_EnvironmentalImpactIndicators.NonRenewableEnergyConsumptionPerUnit.value",
            units: UnitsToString.ELECTRIC_ENERGY
        }
    ]

} as { [key: string]: DetailedAttribute[] }


function TableWithTitle({title, children, id}: { title: string, children: React.ReactNode, id: string }) {
    return (
        <Box id={id} className="table-with-title table-vertical-internal-borders">
            <h3>{title}</h3>
            <TableContainer sx={{width: "100%"}} component={Paper}>
                <Table className={"data-table"}>
                    {children}
                </Table>
            </TableContainer>
        </Box>
    );
}

function MainAttributeTable({currObject}: { currObject: LibraryObjectData | null }) {
    return (
        <TableWithTitle id={"main-attributes-table"} title="Main Attributes">
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

function CollapsableGroupedAttributesTable({currObject, attributeGroupName, attributes}: {
    currObject: LibraryObjectData | null,
    attributeGroupName: string,
    attributes: DetailedAttribute[]
}) {
    return (
        <Accordion>
            <AccordionSummary>
                <Typography variant={"h6"}>{attributeGroupName}</Typography>
            </AccordionSummary>

            <AccordionDetails>
                <TableContainer component={Paper} className={"table-vertical-internal-borders"}>
                    <Table>
                        <TableHead className={"table-column-header-cell"}>
                            <TableRow>
                                <TableCell>Attribute</TableCell>
                                <TableCell>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attributes.map((attribute, index) => {
                                const value = _.get(currObject, attribute.object_path);
                                return (
                                    <TableRow
                                        key={index}>
                                        <TableCell>{attribute.label}</TableCell>
                                        <TableCell>
                                            {value} <Typography variant={"inherit"} component="span"
                                                                fontWeight="bold">{attribute.units}</Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    )
}

function ObjectFilesTable({currObject}: { currObject: LibraryObjectData | null }) {

    const handleEnvironmentalImpactDownload = (object_id: any) => {
        api.get(`/object/${object_id}/environmental-impact`, {responseType: "blob"})
            .then((response) => {
                const blob = new Blob([response.data], {type: "application/pdf"});
                saveAs(blob, `${object_id}_environmental_impact.pdf`);
            }).catch((error) => {
                console.error("Failed to download environmental impact report: ", error);
        })
    }

    return (
        <TableWithTitle id={"object-files-table"} title="Object Files">
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
                    <DownloadTableCell object_id={currObject?.id} handleDownload={handleEnvironmentalImpactDownload} label={"PDF"}/>
                </TableRow>
            </TableBody>
        </TableWithTitle>
    )
}

export default function ViewObject() {
    const [currObject, setCurrObject] = React.useState<LibraryObjectData | null>(null);

    const {object_id} = useParams<{ object_id: string }>();

    useEffect(() => {
        api.get(`/object/${object_id}`)
            .then((response) => setCurrObject(response.data))
            .catch((error) => console.error("Failed to get objects: ", error));
    }, [object_id])


    return (
        <Box id={"view-object-main-box"}>

            <Box id={"view-object-secondary-box"}>
                <ObjectImage object_id={object_id} width={500} height={500}
                             imgID={"large-view-object-img"}/>

                <Paper id={"main-description-box"}>
                    <h2 className={"sub-title"}>{currObject?.name}</h2>

                    <Divider/>

                    <Box sx={{display: "flex", flexDirection: "row", gap: "1rem", justifyContent: "space-around"}}>
                        <MainAttributeTable currObject={currObject}/>

                        <ObjectFilesTable currObject={currObject}/>
                    </Box>

                </Paper>
            </Box>

            <Box id={"detailed-attributes-box"} component={Paper}>
                <Typography variant={"h3"}>Detailed Attributes</Typography>

                <Box>
                    {Object.entries(detailedDescriptionTableAttributes).map(([groupName, attributes], groupIndex) => (
                        <CollapsableGroupedAttributesTable key={groupIndex} currObject={currObject}
                                                           attributeGroupName={groupName} attributes={attributes}/>
                    ))}
                </Box>
            </Box>

            <Box id={"object-links-box"} component={Paper}>
                <Typography variant={"h3"}>Useful Links </Typography>

                <Button>
                    <Link href={{
                        pathname: "/connections",
                        query: {
                            "sectionType": currObject?.property_sets["Identity Data"]["section_type"]["value"],
                            "massPerLength": currObject?.property_sets["Structural"]["MassPerUnitLength_ANZRS"]["value"]
                        }
                    }}
                          passHref>
                        Open connections tool
                    </Link>
                </Button>

                <Button>
                    <Link href={`https://steelandtube.co.nz/`} passHref>
                        Manufacturer&#39;s Website
                    </Link>
                </Button>
            </Box>

        </Box>
    );
}