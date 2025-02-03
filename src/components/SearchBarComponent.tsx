"use client"

import {SubmitHandler, useForm} from "react-hook-form";

interface FormValues {
    search: string;
}

export default function SearchBar() {
    const {register, handleSubmit} = useForm<FormValues>();

    const onSubmit : SubmitHandler<FormValues> = (data: FormValues) => console.log(data);

    return (
        <div className="search-bar-div">
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("search")} placeholder="Search..."/>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}
