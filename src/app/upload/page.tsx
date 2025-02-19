"use client"

import {Box, Button, Typography} from "@mui/material";
import TopNavBar from "@/components/TopNavBar";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {styled} from '@mui/material/styles';
import {useState} from "react";
import api from "@/api";
import {FileOpen} from "@mui/icons-material";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

function PickFileButton({onChange}: { onChange?: (event: any) => void }) {
    return (
        <Button
            id={"pick-file-button"}
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<FileOpen/>}
        >
            Pick IFC File
            <VisuallyHiddenInput
                type="file"
                onChange={onChange}
                multiple
                accept={".ifc"}
            />
        </Button>
    );
}

function UploadButton({onClick, disabled, fileName}: { onClick: () => void, disabled: boolean, fileName?: string }) {
    return (
        <Button
            id={"upload-file-button"}
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon/>}
            onClick={onClick}
            disabled={disabled}
        >
            Save
            {fileName ? <StyledFileName fileName={fileName}/> : null}
        </Button>
    );
}

function StyledFileName({fileName}: { fileName: string }) {
    return (
        <Typography component="span" id={"styled-file-name"}>
            {fileName}
        </Typography>
    )
}

export default function UploadPage() {

    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const newFile = event.target.files[0];
            setFile(newFile);
            setFileName(newFile.name);
        }
    };

    const handleUpload = () => {
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            api.post("/object", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
        }
    }

    return (
        <>
            <Box id={"main-upload-box"}>
                <Box>
                    <h2>
                        Upload an IFC file
                    </h2>
                </Box>

                <Box id={"pick-upload-button-box"}>
                    <PickFileButton onChange={handleFileChange}/>
                    <UploadButton onClick={handleUpload} disabled={!fileName} fileName={fileName}/>
                </Box>

                {/*{file ? <p><StyledFileName fileName={fileName}/> added</p> : null}*/}
            </Box>
        </>
    );
};