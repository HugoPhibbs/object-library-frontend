"use client";

import api from "../api";
import {SubmitHandler, useForm} from "react-hook-form";
import {TextField, Button, Box} from "@mui/material";


class FormValues {
    material: string;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };

    constructor(material: string, dimensions: { length: number; width: number; height: number }) {
        this.material = material;
        this.dimensions = dimensions;
    }

    static toFlatObject(formValues: FormValues) {
        return {
            material: formValues.material,
            "dimensions.height": formValues.dimensions.height,
            "dimensions.width": formValues.dimensions.width,
            "dimensions.length": formValues.dimensions.length
        };
    }
}

function getFilterResults(formValues: FormValues) {
    const apiResponse = api.get("/object/filter", {
        params: FormValues.toFlatObject(formValues)
    });

    console.log(apiResponse);
}


export default function FilterOptions() {
    const {register, handleSubmit} = useForm<FormValues>();

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log("Filtering with data: ", data);
        getFilterResults(data);
    };  

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}
             sx={{display: "flex", flexDirection: "column", gap: 2, maxWidth: 300}}>
            <TextField {...register("material")} label="Material" variant="outlined"/>

            <TextField {...register("dimensions.height")} label="Height" type="number" variant="outlined"/>
            <TextField {...register("dimensions.width")} label="Width" type="number" variant="outlined"/>
            <TextField {...register("dimensions.length")} label="Length" type="number" variant="outlined"/>

            <Button type="submit" variant="contained">Submit</Button>
        </Box>
    );
}
