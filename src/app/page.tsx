"use client"

import React, {useEffect} from "react";
import api from "@/api";
import SearchFilter, {FormValues} from "@/app/home/SearchFilterComponent";
import Box from "@mui/material/Box";
import Results from "@/app/home/ResultsComponent";

export default function Home() {

    const [results, setResults] = React.useState([]);

    useEffect(() => {
        api.get("/object")
            .then((response) => setResults(response.data))
            .catch((error) => console.error("Failed to get objects: ", error));
    }, []);

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
}
