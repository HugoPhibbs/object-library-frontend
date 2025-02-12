import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel
} from '@mui/material';
import {saveAs} from 'file-saver';
import DownloadIcon from '@mui/icons-material/Download';
import api from "@/api";
import Image from "next/image";

// Define columns

type ColumnData = {
    id: string;
    label: string;
    canSort: boolean;
}

const columns: ColumnData[] = [
    {id: 'id', label: 'ID', canSort: false},
    {id: 'name', label: 'Name', canSort: false},
    {id: "ifc_type", label: "IFC Type", canSort: false},
    {id: "material", label: "Material", canSort: false},
    {id: "load_bearing", label: "Load Bearing", canSort: true},
    {id: "form_factor", label: "Form Factor", canSort: true},
    {id: "photo", label: "Photo", canSort: false},
    {id: "download", label: "Download", canSort: false},
];

// Type for row data
interface RowData {
    id: number;
    name: string;
    ifc_type: string;
    material: string;
    load_bearing: boolean;
    form_factor: string;
}

function parseSearchResults(data: any[]): RowData[] {
    if (data === undefined) {
        return [];
    }

    data.sort((a, b) => a._score - b._score);

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

function booleanToYesNo(value: boolean): string {
    return value ? "Yes" : "No";
}

function Row({row}: { row: RowData }) {
    return (
        <TableRow>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.ifc_type}</TableCell>
            <TableCell>{row.material}</TableCell>
            <TableCell>{booleanToYesNo(row.load_bearing)}</TableCell>
            <TableCell>{row.form_factor}</TableCell>
            <PhotoCell row={row}/>
            <DownloadCell row={row}/>
        </TableRow>
    );
}

export default function Results({data}: any) {

    const [orderBy, setOrderBy] = useState("id");
    const [order, setOrder] = useState<"asc" | "desc">("asc");

    data = parseSearchResults(data);

    console.log(data)

    const sortedData = data.sort((a: any, b: any) => {
        return order === "asc" ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
    });

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            // TODO, find a way to disable sorting, i.e. toggle asc, desc, none
                            <TableCell key={column.id} className={"table-column-header-cell"}>
                                {column.canSort ?
                                    <TableSortLabel
                                        active={orderBy === "id"}
                                        direction={order}
                                        onClick={() => {
                                            setOrderBy(column.id);
                                            setOrder(order === "asc" ? "desc" : "asc");
                                        }}>
                                    {column.label}
                                    </TableSortLabel> :
                                    <Box>{column.label}</Box>}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedData.map((row: RowData) => (
                        <Row key={row.id} row={row}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
        ;
}
