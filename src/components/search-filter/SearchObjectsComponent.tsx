"use client"

import React from 'react';
import SearchFilter from './SearchFilterComponent';
import Results from './ResultsComponent';
import Box from '@mui/material/Box';
import api from "@/api";
import {FormValues} from "@/components/search-filter/SearchFilterComponent";

export default function SearchObjects() {

    const [results, setResults] = React.useState([]);

    async function handleFilterSubmit(formValues: FormValues) {
        try {
            const formValuesFlat = FormValues.toFlatObject(formValues)

            const apiResponse = await api.get("/object/filter", {
                params: formValuesFlat
            });
            const data = apiResponse.data;
            console.log(data)
            setResults(data);
        } catch (e) {
            console.error("Failed to get filter results: ", e);
        }
    }

    return (
        <Box className={"search-objects-component"}>
            <SearchFilter handleFilterSubmitToParent={handleFilterSubmit}/>
            <Results data={results}/>
        </Box>
    );
};