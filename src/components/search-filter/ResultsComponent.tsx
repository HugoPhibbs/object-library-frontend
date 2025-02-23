import React, {useEffect, useState} from 'react';
import {
    Box, FormControl, InputLabel,
    Link as MuiLink, MenuItem, Paper, Select,
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
import _, {orderBy} from "lodash";

// Define columns

type ColumnData = {
    id: string;
    label: string;
    canSort?: boolean;
}

const columns: ColumnData[] = [
    // {id: 'id', label: 'ID', canSort: false},
    {id: 'name', label: 'Name', canSort: true},
    {id: "material", label: "Material", canSort: true},
    {id: "photo", label: "Photo", canSort: false},
    {id: "download", label: "Download", canSort: false},
];

function Row({object}: { object: LibraryObject }) {
    return (
        <TableRow hover>
            <TableCell><ViewObjectLink object_id={object.id} label = {object.name}/></TableCell>
            <TableCell>{object.material}</TableCell>
            <TableCell><ObjectImage object_id={object.id} width={200} height={200}/></TableCell>
            <IfcDownloadTableCell object_id={object.id}/>
        </TableRow>
    );
}

function ViewObjectLink({object_id, label}: { object_id: string, label?:string }) {
    return <MuiLink className={"view-object-link"} component={Link} href={`/object/${object_id}`} underline="always">
        {label ? label : object_id} <OpenInNewIcon fontSize="small" sx={{ml: 0.5}} color={"primary"}/>
    </MuiLink>
}

function SortByDropdown({orderBy, setOrderBy}: {
    orderBy: string,
    setOrderBy: (value: string) => void
}) {

    const dropdownChange = (e: any) => {
        setOrderBy(e.target.value)
    }

    const sortableColumns = columns.filter(column => column.canSort);
    sortableColumns.splice(0, 0, {id: "score", label: "Relevancy"}) // Add to start

    const dropdownOptions = []

    for (const col of sortableColumns) {
        const thisDropDownOptions = [
            {value: `${col.id}-desc`, label: `${col.label} (desc)`},
            {value: `${col.id}-asc`, label: `${col.label} (asc)`},
        ]
        dropdownOptions.push(...thisDropDownOptions)
    }

    return (
        <FormControl id="sort-by-dropdown-control">
            <InputLabel>Sort By</InputLabel>

            <Select value={orderBy} onChange={dropdownChange} label={"Sort By"}>
                {dropdownOptions.map((option, index) => (
                    <MenuItem key={index} value={option.value}>{option.label}</MenuItem>))}
            </Select>
        </FormControl>
    );
}

export default function Results({data}: { data: FilteredLibraryObject[] }) {
    const [sortedData, setSortedData] = useState<FilteredLibraryObject[]>([]);
    const [orderBy, setOrderBy] = useState("score-desc");

    useEffect(() => {
        const [attributeToSort, sortOrder] = orderBy.split("-") as [string, "asc" | "desc"];

        const path = attributeToSort == "score" ? "score" : "object." + attributeToSort;

        setSortedData(_.orderBy(data, [path], [sortOrder]));
    }, [data, orderBy]);

    return (
        <Box id="results-box">
            <Box>
                <SortByDropdown orderBy={orderBy} setOrderBy={setOrderBy}/>
            </Box>
            <TableContainer>

                <Table className={"data-table"} stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell key={index} className={"table-column-header-cell"}>
                                    {column.label}
                                </TableCell>
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
        </Box>
    )
}
