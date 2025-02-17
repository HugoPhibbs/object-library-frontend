"use client"

import {useParams} from "next/navigation";
import {Box} from "@mui/material";
import Grid from "@mui/material/Grid2"
import SearchObjects from "@/components/search-filter/SearchAndResultsComponent";
import Image from "next/image";
import React from "react";
import {ObjectImage} from "@/components/common"
import api from "@/api";

export default function ViewObject() {
    const {object_id} = useParams<{ object_id: string }>();

    api.get(`object/${object_id}`).then(

    )

    return (
        <Box p={3}>
            <Box className={"title-box"}>
                <h1 className={"title"}>Object ID: {object_id}</h1>
            </Box>

            <Box className={"content"}>
                <Grid container spacing={2} sx={{height: "60rem", width: "80rem"}}>
                    <Grid size={4} className={"outline-box"}>
                        <ObjectImage object_id={object_id} width={500} height={500}/>
                    </Grid>

                    <Grid size={8} className={"outline-box"}>
                        <div style={{backgroundColor: 'lightcoral', height: '100%'}}>Item 2 (60%)</div>
                    </Grid>

                    <Grid size={12} className={"outline-box"}>
                        <div style={{backgroundColor: 'lightgreen', height: '100%'}}>Item 3 (100%)</div>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}