"use client"

import {SubmitHandler, useForm} from "react-hook-form";

interface FormValues {
    material: string;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
}

export default function FilterOptions() {
    const {register, handleSubmit} = useForm<FormValues>();

    const onSubmit: SubmitHandler<FormValues> = (data: FormValues) => console.log(data);

    return (
        <div className="filters-div">
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("material")} type="string" placeholder="Material"/>
                <input {...register("dimensions.height")} type="number" placeholder="Height"/>
                <input {...register("dimensions.width")} type="number" placeholder="Width"/>
                <input {...register("dimensions.length")} type="number" placeholder="Length"/>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}
