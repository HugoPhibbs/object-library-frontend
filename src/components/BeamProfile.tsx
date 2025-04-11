"use client"

import {LibraryObjectData} from "@/utils";
import {useEffect, useState} from "react";
import {Box} from "@mui/material";
import Image from "next/image";

export default function BeamProfile({object} : {object: LibraryObjectData | null}) {
    const [svgUrl, setSvgUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!object) return;

        let url: string;

        fetch("/beam_template.svg")
            .then(res => res.text())
            .then(data => {
                data = data.replace(/{{HEIGHT}}/g, object.property_sets["Dimensions"]["Height"].value);
                data = data.replace(/{{F_WIDTH}}/g, object.property_sets["Dimensions"]["Width"].value);
                data = data.replace(/{{F_THICK}}/g, object.property_sets["Dimensions"]["Flange Thickness"].value);
                data = data.replace(/{{W_THICK}}/g, object.property_sets["Dimensions"]["Web Thickness"].value);

                url = URL.createObjectURL(new Blob([data], { type: "image/svg+xml" }));
                setSvgUrl(url);
            });

        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [object]);


    return <Box className={"outline-box"} display={"flex"} justifyContent={"center"} alignItems={"center"}>
        {svgUrl ? <Image src={svgUrl} width={500}   height={0}
                         style={{ height: "auto" }} alt={"Beam Profile"} /> : <span>Loading...</span>}
    </Box>;
}