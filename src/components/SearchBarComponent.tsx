"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { TextField, Button, Box } from "@mui/material";

interface FormValues {
  search: string;
}

export default function SearchBar() {
  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = (data) => console.log(data);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <TextField {...register("search")} label="Search" variant="outlined" size="small" />
      <Button type="submit" variant="contained">Submit</Button>
    </Box>
  );
}
