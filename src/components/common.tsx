"use client"

import React, {useEffect, useState} from 'react';
import api from "@/api";
import Image from "next/image";
import {saveAs} from "file-saver";
import {Button, TableCell} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

export function ObjectImage({object_id, width, height}: { object_id: string, width: number, height: number }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const apiURL = `/object/${object_id}/photo`;

    useEffect(() => {
        api.get(apiURL, {responseType: "blob"})
            .then((response) => {
                setImageUrl(URL.createObjectURL(response.data));
            })
            .catch((e) => console.error("Failed to download photo:", e));
    }, [apiURL]);

    if (!imageUrl) {
        return <span>Loading...</span>;
    }

    return <Image src={imageUrl} alt="Object" width={width} height={height}/>;
}

export function DownloadTableCell({object_id, handleDownload, label}: {
    object_id: string,
    handleDownload: any,
    label: string
}) {

    return <TableCell>
        <Button variant="contained" size="small" startIcon={<DownloadIcon/>}
                onClick={() => handleDownload(object_id)}>{label}
        </Button>
    </TableCell>
}

export function IfcDownloadTableCell({object_id}: { object_id: string }) {

    async function handleDownload(object_id: string) {
        try {
            const apiResponse = await api.get(`/object/${object_id}`, {params: {format: "ifc"}})
            const blob = new Blob([apiResponse.data])
            saveAs(blob, `${object_id}.ifc`)
        } catch (e) {
            console.error("Failed to download file: ", e)
        }
    }

    return <DownloadTableCell object_id={object_id} handleDownload={handleDownload} label={"IFC"}/>
}