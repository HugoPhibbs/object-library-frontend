"use client";

import api from "../../api";
import {SubmitHandler, useForm} from "react-hook-form";
import {TextField, Button, Box} from "@mui/material";


export class FormValues {
    search: string;
    material: string;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };

    constructor(search: string, material: string, dimensions: { length: number; width: number; height: number }) {
        this.search = search;
        this.material = material;
        this.dimensions = dimensions;
    }

    static toFlatObject(formValues: FormValues) {
        return {
            material: formValues.material,
            "Dimensions.Height": formValues.dimensions.height,
            "Dimensions.Width": formValues.dimensions.width,
            "Dimensions.Length": formValues.dimensions.length
        };
    }
}

export default function SearchFilter({handleFilterSubmitToParent}: {
    handleFilterSubmitToParent: (formValues: FormValues) => void
}) {
    const {register, handleSubmit} = useForm<FormValues>({
        defaultValues: {
            search: "",
            material: ""
        }
    });

    const onSubmit: SubmitHandler<FormValues> = (data) => {
        console.log("Filtering with data: ", data);
        handleFilterSubmitToParent(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className={"search-filter"}>
            <TextField {...register("search")} label="Search" variant="outlined" size="small"/>

            <TextField {...register("material")} label="Material" variant="outlined"/>

            <TextField {...register("dimensions.height", {valueAsNumber: true})} label="Height" type="number"
                       variant="outlined"/>
            <TextField {...register("dimensions.width", {valueAsNumber: true})} label="Width" type="number"
                       variant="outlined"/>
            <TextField {...register("dimensions.length", {valueAsNumber: true})} label="Length" type="number"
                       variant="outlined"/>

            <Button type="submit" variant="contained">Submit</Button>
        </Box>
    );
}
