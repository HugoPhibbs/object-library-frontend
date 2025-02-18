import React, {useEffect, useState} from 'react';
import {
    Box,
    Link as MuiLink,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from "next/link";
import {IfcDownloadTableCell, ObjectImage} from "@/components/common";
import {FilteredLibraryObject, LibraryObject} from "@/utils";

// Define columns

type ColumnData = {
    id: string;
    label: string;
    canSort: boolean;
}

const columns: ColumnData[] = [
    {id: 'id', label: 'ID', canSort: false},
    {id: 'name', label: 'Name', canSort: true},
    // {id: "ifc_type", label: "IFC Type", canSort: false},
    {id: "material", label: "Material", canSort: false},
    // {id: "load_bearing", label: "Load Bearing", canSort: true},
    // {id: "form_factor", label: "Form Factor", canSort: true},
    {id: "photo", label: "Photo", canSort: false},
    {id: "download", label: "Download", canSort: false},
];

function Row({object}: { object: LibraryObject }) {
    return (
        <TableRow>
            <TableCell><ViewObjectLink object_id={object.id}/></TableCell>
            <TableCell>{object.name}</TableCell>
            {/*<TableCell>{row.ifc_type}</TableCell>*/}
            <TableCell>{object.material}</TableCell>
            {/*<TableCell>{booleanToYesNo(row.load_bearing)}</TableCell>*/}
            {/*<TableCell>{row.form_factor}</TableCell>*/}
            <TableCell>
                <ObjectImage object_id={object.id} width={200} height={200}/>
            </TableCell>
            <IfcDownloadTableCell object_id={object.id}/>
        </TableRow>
    );
}

function ViewObjectLink({object_id}: { object_id: string }) {
    return <MuiLink component={Link} href={`/object/${object_id}`} underline="always">
        {object_id} <OpenInNewIcon fontSize="small" sx={{ml: 0.5}}/>
    </MuiLink>
}

function SortableTableHeadCell({column, orderBy, direction, onClick}: {
    column: ColumnData,
    orderBy: string,
    direction: "asc" | "desc",
    onClick: () => void
}) {
    return (
        <TableCell className={"table-column-header-cell"}>
            {column.canSort ? (
                <TableSortLabel
                    active={orderBy === "id"}
                    direction={direction}
                    onClick={onClick}>
                    {column.label}
                </TableSortLabel>
            ) : (
                <Box>{column.label}</Box>
            )}
        </TableCell>
    );
}

export default function Results({data}: {data: FilteredLibraryObject[]}) {
    const [sortedData, setsortedData] = useState<FilteredLibraryObject[]>([]);
    const [orderBy, setOrderBy] = useState("id");
    const [order, setOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        setsortedData(data.toSorted((object_a: FilteredLibraryObject, object_b: FilteredLibraryObject) => {
                return order === "asc" ? object_a.score - object_b.score : object_b.score - object_a.score;
            })
        );
    }, [data, order]);

    return (
        <TableContainer>
            <Table className={"data-table"}>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            // TODO, find a way to disable sorting, i.e. toggle asc, desc, none
                            <SortableTableHeadCell key={column.id} column={column} orderBy={orderBy}
                                                   direction={order}
                                                   onClick={() => {
                                                       setOrderBy(column.id);
                                                       setOrder(order === "asc" ? "desc" : "asc");
                                                   }}/>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedData.map((object: FilteredLibraryObject) => (
                        <Row key={object.object.id} object={object.object}/>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
        ;
}
