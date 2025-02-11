import React, {useEffect, useState} from 'react';
import {Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from '@mui/material';
import {saveAs} from 'file-saver';
import DownloadIcon from '@mui/icons-material/Download';
import api from "@/api";
import Image from "next/image";

// Define columns

const columns = [
    {id: 'id', label: 'ID'},
    {id: 'name', label: 'Name'},
    {id: "ifc_type", label: "IFC Type"},
    {id: "material", label: "Material"},
    {id: "load_bearing", label: "Load Bearing"},
    {id: "form_factor", label: "Form Factor"},
    {id: "photo", label: "Photo"},
    {id: "download", label: "Download"}
];

// Type for row data
interface RowData {
    id: number;
    name: string;
    ifc_type: string;
    material: string;
    load_bearing: string;
    form_factor: string;
}

function parseSearchResults(data: any): RowData[] {
    if (data === undefined) {
        return [];
    }

    return data.map((row: any) => {
        return {
            id: row._id,
            name: row._source.name,
            ifc_type: row._source.ifc_type,
            material: row._source.material,
            load_bearing: row._source.property_sets.Pset_BeamCommon.LoadBearing.value,
            form_factor: row._source.property_sets["Structural Analysis"]["Form Factor"].value,
        };
    });
}

function DownloadCell({row}: { row: RowData }) {

    async function handleDownload(row: RowData) {
        try {
            const apiResponse = await api.get(`/object/${row.id}`)
            const blob = new Blob([apiResponse.data])
            saveAs(blob, `${row.id}.ifc`)
        } catch (e) {
            console.error("Failed to download file: ", e)
        }
    }

    return <TableCell>
        <Button variant="contained" size="small" startIcon={<DownloadIcon/>} onClick={() => handleDownload(row)}>IFC
        </Button>
    </TableCell>
}

function PhotoCell({row}: { row: RowData }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        api.get(`/object/${row.id}/photo`, {responseType: "blob"})
            .then((response) => {
                setImageUrl(URL.createObjectURL(response.data));
            })
            .catch((e) => console.error("Failed to download photo:", e));
    }, [row.id]);

    return (
        <TableCell>
            {imageUrl ? <Image src={imageUrl} alt="Object" width={200} height={200}/> : "Loading..."}
        </TableCell>
    );
}


function Row({row}: { row: RowData }) {
    return (
        <TableRow>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.ifc_type}</TableCell>
            <TableCell>{row.material}</TableCell>
            <TableCell>{row.load_bearing}</TableCell>
            <TableCell>{row.form_factor}</TableCell>
            <PhotoCell row={row}/>
            <DownloadCell row={row}/>
        </TableRow>
    );
}

export default function Results({data}: any) {

    data = parseSearchResults(data);

    console.log(data)

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell key={column.id}>{column.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row: RowData) => (
                        <Row key={row.id} row={row}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
        ;
}
