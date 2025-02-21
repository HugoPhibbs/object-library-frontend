"use client"

import {Box, Button, FormControlLabel, TextField, Typography} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TopNavBar from "@/components/TopNavBar";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {styled} from '@mui/material/styles';
import {useState} from "react";
import api from "@/api";
import {CheckCircle, FileOpen} from "@mui/icons-material";
import {green} from "@mui/material/colors";
import {throwWithStaticGenerationBailoutErrorWithDynamicError} from "next/dist/server/request/utils";


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

function PickFileButton({onChange}: { onChange?: (event: any) => void}) {
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

function FileUploadIcon({fileUploaded, fileUploadError}: { fileUploaded: boolean, fileUploadError: boolean }) {
    if (fileUploaded) {
        return <CheckCircleIcon/>
    } else if (fileUploadError) {
        return <HighlightOffIcon color={"error"}/>
    } else {
        return <CloudUploadIcon/>
    }
}

function UploadButton({onClick, disabled, fileName, fileUploaded, fileUploadError, fileUpdatedOrCreated}: {
    onClick: () => void,
    disabled: boolean,
    fileName?: string,
    fileUploaded: boolean,
    fileUploadError: boolean,
    fileUpdatedOrCreated: boolean
}) {
    return (
        <Button
            id={"upload-file-button"}
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<FileUploadIcon fileUploaded={fileUploaded} fileUploadError={fileUploadError}/>}
            color={fileUploaded ? "success" : fileUploadError ? "error" : "primary"}
            sx={(theme) => ({
                color: "white",
                border: `3px solid ${fileUploaded ? green[500] : fileUploadError ? "red" : null}`,
                "&.Mui-disabled": {
                    backgroundColor: fileUploaded ? theme.palette.success.main : "light-grey",
                    color: fileUploaded ? "white" : "inherit",
                }
            })}
            onClick={onClick}
            disabled={disabled}
        >
            {fileUploaded ? fileUpdatedOrCreated ? "Updated" : "Created" : fileUploadError ? "Error" : "Upload"}
            {fileName ? (
                <Typography component="span" id={"styled-file-name"}>
                    {fileName}
                </Typography>
            ) : null}
        </Button>
    );
}

export default function UploadPage() {

    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [customID, setCustomID] = useState<string>("");
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);
    const [fileUploadError, setFileUploadError] = useState<boolean>(false);
    const [fileUpdatedOrCreated, setFileUpdatedOrCreated] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const newFile = event.target.files[0];
            setFile(newFile);
            setFileName(newFile.name);
            setFileUploaded(false);
            setFileUploadError(false);
            setFileUpdatedOrCreated(false);
        }
    };

    const handleUpload = () => {
        if (file) {
            const formData = new FormData();

            formData.append("file", file);
            if (customID) formData.append('customID', customID);

            api.post("/object", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then((response) => {
                setFileUploaded(true);
                setFileUploadError(false);

                if (response.status === 201) setFileUpdatedOrCreated(false); else setFileUpdatedOrCreated(true);

            }).catch((error) => {
                console.error("Failed to upload file: ", error);
                setFileUploadError(true);
                setFileUploaded(false);
            });
        }
    }

    const customIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCustomID(event.target.value);
        setFileUploaded(false);
        setFileUploadError(false);
        setFileUpdatedOrCreated(false);
    }

    return (
        <>
            <Box id={"main-upload-box"}>
                <Box id="upload-info-box">
                    <h2>
                        Upload an IFC file
                    </h2>

                    <p>
                        Upload an IFC file to add it to the object library. Optionally, you can provide a custom ID to
                        associate with the file.

                        If an object with the same ID already exists, it will be updated with the new file.
                    </p>
                </Box>

                <Box id={"pick-upload-button-box"}>
                    <PickFileButton onChange={handleFileChange}/>
                    <TextField onChange={customIdChange} label={"Enter Custom ID"}></TextField>

                    <Box>
                        <UploadButton onClick={handleUpload}
                                      disabled={!fileName || fileUploaded || fileUploadError}
                                      fileName={fileName}
                                      fileUploaded={fileUploaded}
                                      fileUploadError={fileUploadError}
                                      fileUpdatedOrCreated={fileUpdatedOrCreated}
                        />
                    </Box>
                </Box>

                {/*{file ? <p><StyledFileName fileName={fileName}/> added</p> : null}*/}
            </Box>
        </>
    );
};