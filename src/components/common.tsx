"use client"

import React, {useEffect, useState} from 'react';
import api from "@/api";
import Image from "next/image";
import {saveAs} from "file-saver";
import {Box, Button, FormControl, InputLabel, MenuItem, Select, TableCell} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {Controller} from "react-hook-form";

export function ObjectImage({objectID, width, height, imgClassName, imgID}: {
    objectID: string,
    width: number,
    height: number,
    imgClassName?: string
    imgID?: string
}) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        api.get(`/object/${objectID}/photo`, {responseType: "blob"})
            .then((response) => {
                setImageUrl(URL.createObjectURL(response.data));
            })
            .catch((e) => console.error("Failed to download photo:", e));
    }, [objectID]);

    if (!imageUrl) {
        return <span>Loading...</span>;
    }

    return <Image src={imageUrl} alt="Object" width={width} height={height} className={imgClassName} id={imgID}/>;
}

export function DownloadTableCell({objectID, handleDownload, label, dropdownOptions, StartIcon, dropDownLabel}: {
    objectID?: string,
    handleDownload: any,
    label: string,
    dropdownOptions?: string[],
    StartIcon?: React.ElementType,
    dropDownLabel?: string
}) {

    const [dropdownOption, setDropdownOption] = useState<string>("");

    const handleDropdownChange = (event: any) => {
        setDropdownOption(event.target.value);
    }

    return <TableCell className={"download-table-cell"}>
        <Box>
            {dropdownOptions ?
                (<>
                        <FormControl>
                            <InputLabel id="download-dropdown-label">{dropDownLabel}</InputLabel>
                            <Select value={dropdownOption} onChange={handleDropdownChange} label={dropDownLabel}
                                    className={'download-dropdown-label'}>
                                {dropdownOptions.map((option, index) => (
                                    <MenuItem key={index} value={option}>{option}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </>
                )
                : null
            }

            <Button variant="contained" size="small" startIcon={StartIcon ? <StartIcon/> : <DownloadIcon/>}
                    onClick={() => dropdownOptions ? handleDownload(objectID, dropdownOption) : handleDownload(objectID)}>{label}
            </Button>
        </Box>
    </TableCell>
}

export function IfcDownloadTableCell({objectID}: { objectID?: string }) {

    async function handleDownload(objectID: string) {
        try {
            const apiResponse = await api.get(`/object/${objectID}`, {params: {format: "ifc"}})
            const blob = new Blob([apiResponse.data])
            saveAs(blob, `${objectID}.ifc`)
        } catch (e) {
            console.error("Failed to download file: ", e)
        }
    }

    return <DownloadTableCell objectID={objectID} handleDownload={handleDownload} label={"IFC"} StartIcon={IfcIcon}/>
}

export function IfcIcon({width = 36, height = 36}: { width?: number, height?: number }) {
    return <Image src="/ifc_logo.svg"
                  width={width}
                  height={height}
                  alt="IFC Logo"/>
}

export function CheckIcon({width = 36, height = 36}: { width?: number, height?: number }) {
    return <Image src="/check_icon.svg"
                  width={width}
                  height={height}
                  alt="Check Icon"/>
}

export function CrossIcon({width = 36, height = 36}: { width?: number, height?: number }) {
    return <Image src="/cross_icon.svg"
                  width={width}
                  height={height}
                  alt="Cross Icon"/>
}

export function SelectConnectionType({control, defaultValue}: { control: any, defaultValue?: string }) {

    const [connectionTypes, setConnectionTypes] = useState<string[]>([]);

    useEffect(() => {
        api.get("/connection/unique-values", {params: {field: "connection_type"}})
            .then((response) => {
                setConnectionTypes(response.data.sort())
                console.log(response.data)
            })
            .catch((error) => console.error("Failed to get section types: ", error));
    }, []);

    return (
        <FormControl>
            <InputLabel id="connection-type-select-label">Connection Type</InputLabel>

            <Controller
                name="connectionType"
                control={control}

                render={({field}) => (
                    <Select labelId="connection-type-select-label" {...field}
                            id="connection-type-select" type="text" label="Connection Type" required>
                        {connectionTypes.map((connectionType, index) => (
                            <MenuItem key={index} value={connectionType}>{connectionType}</MenuItem>
                        ))}
                    </Select>
                )}
            />
        </FormControl>
    )
}

export function SelectMomentShearRatio({control}: { control: any }) {
    return (
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
    )
}
