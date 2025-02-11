// import Image from "next/image";
import SearchObjects from "@/components/search-filter/SearchAndResultsComponent";

import {Box} from "@mui/material"

export default function Home() {
    return (
        <Box p = {3}>
            <Box className={"title-box"}>
                <h1 className={"title"}>Object Library</h1>
            </Box>

            <Box className={"content"}>
                <SearchObjects/>
            </Box>
        </Box>
    );
}
