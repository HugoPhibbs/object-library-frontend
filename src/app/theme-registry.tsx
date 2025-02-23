"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";
import {green} from "@mui/material/colors";

const theme = createTheme({
    palette: {
        primary: {
            main: "#02b0f3",
        },
        success: {
            main: green[500],
        },
    },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
