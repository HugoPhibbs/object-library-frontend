// import Image from "next/image";
import SearchBar from "@/components/SearchBarComponent";
import FilterOptions from "@/components/FilterComponent";
import Results from "@/components/ResultsComponent";

export default function Home() {
    return (
        <div>
            <div className={"title-div"}>
                <h1 className={"title"}>Object Library</h1>
            </div>

            <div className={"content-div"}>

                <div className={"search-div"}>
                    <SearchBar/>
                    <FilterOptions/>
                </div>

                <Results/>
            </div>
        </div>
    );
}
