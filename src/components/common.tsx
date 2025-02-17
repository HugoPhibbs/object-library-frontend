"use client"

import React, {useEffect, useState} from 'react';
import api from "@/api";
import Image from "next/image";

export function ObjectImage({object_id, width, height}: { object_id: string, width: number, height: number }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const apiURL = `/object/${object_id}/photo`;

    useEffect(() => {
        api.get(apiURL, { responseType: "blob" })
            .then((response) => {
                setImageUrl(URL.createObjectURL(response.data));
            })
            .catch((e) => console.error("Failed to download photo:", e));
    }, [apiURL]);

    if (!imageUrl) {
        return <span>Loading...</span>;
    }

    return <Image src={imageUrl} alt="Object" width={width} height={height} />;
}