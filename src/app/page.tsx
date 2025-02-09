// import Image from "next/image";
import SearchBar from "@/components/SearchBarComponent";
import FilterOptions from "@/components/FilterComponent";
import Results from "@/components/ResultsComponent";

import {Box} from "@mui/material"

export default function Home() {
    return (
        <Box p = {3}>
            <Box className={"title-div"}>
                <h1 className={"title"}>Object Library</h1>
            </Box>

            <Box className={"content-div"}>

                <Box className={"search-div"}>
                    <SearchBar/>
                    <FilterOptions/>
                </Box>

                <Results/>
            </Box>
        </Box>
    );
}
