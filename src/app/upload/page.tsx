"use client"

import {Box, Button, FormControl, IconButton, InputLabel, TextField, Typography} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import ForestIcon from '@mui/icons-material/Forest';
import {styled} from '@mui/material/styles';
import {Component, ReactNode, useEffect, useState} from "react";
import api from "@/api";
import {green} from "@mui/material/colors";
import {IfcIcon} from "@/components/common";
import {AttachFile} from "@mui/icons-material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Dayjs} from "dayjs";

// For uploading files
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

type InspectionRecord = {
    date: Dayjs | null,
    file?: File
}


function PickFileButton({onChange, label, StartIcon, accept_types}: {
    onChange: (event: any) => void,
    label: string,
    StartIcon: ReactNode,
    accept_types: string[]
}) {
    return (
        <Button
            className={"pick-file-button"}
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={StartIcon}
        >
            {label}
            <VisuallyHiddenInput
                type="file"
                onChange={onChange}
                multiple
                accept={accept_types.join(",")}
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

function UploadSingleInspectionRecord({record, dateOnChange, removeOnClick, fileOnChange}: {
    record: { date: Dayjs | null; file?: File },
    dateOnChange: (newValue: Dayjs | null) => void,
    fileOnChange: (file: File) => void,
    removeOnClick: () => void
}) {
    return (
        <Box className="single-inspection-record-box">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    views={["year", "month"]}
                    label="Month & Year"
                    value={record.date}
                    onChange={dateOnChange}
                    className="inspection-date-picker"
                />
            </LocalizationProvider>

            <PickFileButton onChange={(e) => fileOnChange(e.target.files?.[0])} label="PDF"
                            StartIcon={<PictureAsPdfIcon/>}
                            accept_types={[".pdf"]}/>

            <IconButton color="error" onClick={removeOnClick}>
                <RemoveIcon/>
            </IconButton>
        </Box>
    );
}

function UploadInspectionRecords({inspectionRecords, setInspectionRecords}: {
    inspectionRecords: InspectionRecord[],
    setInspectionRecords: any
}) {

    const handleAddRecord = () => {
        setInspectionRecords([...inspectionRecords, {date: null, file: undefined}]);
    }

    const handleRemoveRecord = (index: number) => {
        const newRecords = [...inspectionRecords];
        newRecords.splice(index, 1);
        setInspectionRecords(newRecords);
    }

    const handleDateChange = (index: number, date: Dayjs | null) => {
        const newRecords = [...inspectionRecords];
        newRecords[index].date = date;
        setInspectionRecords(newRecords);
    }

    const handleFileChange = (index: number) => {
        return (file: File) => {
            const newRecords = [...inspectionRecords];
            newRecords[index].file = file;
            setInspectionRecords(newRecords)
        }
    }

    return (
        <Box id={"inspection-records-box"}>
            <Typography variant={"h3"}>Inspection Records</Typography>

            <Box>
                {inspectionRecords.map((record, index) => (
                    <UploadSingleInspectionRecord key={index} record={record}
                                                  dateOnChange={(newValue) => handleDateChange(index, newValue)}
                                                  removeOnClick={() => handleRemoveRecord(index)}
                                                  fileOnChange={(file: File) => handleFileChange(index)(file)}
                    />
                ))
                }
            </Box>

            <Button startIcon={<AddIcon/>} onClick={handleAddRecord}>Add</Button>
        </Box>
    )
}


function postIFCFile(ifcFile: File, customID: string, setFileUploaded: any, setFileUploadError: any, setFileUpdatedOrCreated: any, setCreatedObjectId: any) {
    const formData = new FormData();

    formData.append("file", ifcFile);
    if (customID) formData.append('customID', customID);

    api.post("/object", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then((response) => {
        setFileUploaded(true);
        setFileUploadError(false);

        const newObjectId = response.data.object_id // API uses snake case
        setCreatedObjectId(newObjectId);

        if (response.status === 201) setFileUpdatedOrCreated(false); else setFileUpdatedOrCreated(true);

    }).catch((error) => {
        console.error("Failed to upload file: ", error);
        setFileUploadError(true);
        setFileUploaded(false);
    });
}

function postInspectionRecords(inspectionRecords: InspectionRecord[], objectID: string) {
    for (const record of inspectionRecords) {
        if (record.date && record.file) {
            const formData = new FormData();
            const dateString = record.date.format("MMM-YY");

            formData.append("file", record.file);
            formData.append("date", dateString);

            api.post(`/object/${objectID}/inspection-record`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then((response) => {
                console.log("Inspection record uploaded: ", response.data);
            }).catch((error) => {
                console.error("Failed to upload inspection record: ", error);
            });
        }
    }
}

function postFile(file: File | null, endpoint: string) {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    api.post(endpoint, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    }).then((response) => {
        console.log(`File uploaded to ${endpoint}:`, response.data);
    }).catch((error) => {
        console.error(`Failed to upload file to ${endpoint}:`, error);
    });
}

function postObjectPhoto(file: File | null, objectID: string) {
    return postFile(file, `/object/${objectID}/photo`);
}

function postEnvironmentalImpact(file: File | null, objectID: string) {
    return postFile(file, `/object/${objectID}/environmental-impact`);
}

function postManufacturersBooklet(file: File | null, objectID: string) {
    return postFile(file, `/object/${objectID}/manufacturers-booklet`);
}

export default function UploadPage() {

    const [ifcFile, setIfcFile] = useState<File | null>(null);
    const [objectPhoto, setObjectPhoto] = useState<File | null>(null);
    const [environmentalImpactPdf, setEnvironmentalImpactPdf] = useState<File | null>(null);
    const [manufacturersBookletPdf, setManufacturersBookletPdf] = useState<File | null>(null);
    const [ifcFileName, setIfcFileName] = useState<string>("");
    const [customID, setCustomID] = useState<string>("");
    const [fileUploaded, setFileUploaded] = useState<boolean>(false);
    const [fileUploadError, setFileUploadError] = useState<boolean>(false);
    const [fileUpdatedOrCreated, setFileUpdatedOrCreated] = useState<boolean>(false);
    const [createdObjectId, setCreatedObjectId] = useState<string>("");
    const [inspectionRecords, setInspectionRecords] = useState<{ date: Dayjs | null, file?: File }[]>([{
        date: null,
        file: undefined
    }]);

    const handleIfcFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const newIfcFile = event.target.files[0];
            setIfcFile(newIfcFile);
            setIfcFileName(newIfcFile.name);
            setFileUploaded(false);
            setFileUploadError(false);
            setFileUpdatedOrCreated(false);
        }
    };

    const handleUpload = () => {
        if (ifcFile) {
            postIFCFile(ifcFile, customID, setFileUploaded, setFileUploadError, setFileUpdatedOrCreated, setCreatedObjectId);
        }
    }

    useEffect(() => {
        if (fileUploaded && createdObjectId) {
            postInspectionRecords(inspectionRecords, createdObjectId);
            postObjectPhoto(objectPhoto, createdObjectId);
            postEnvironmentalImpact(environmentalImpactPdf, createdObjectId);
            postManufacturersBooklet(manufacturersBookletPdf, createdObjectId);
        }
    }, [fileUploaded, createdObjectId, inspectionRecords, objectPhoto, environmentalImpactPdf, manufacturersBookletPdf]);

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

                        You can also add an optional object photo file.

                        If an object with the same ID already exists, it will be updated with the new file.
                    </p>
                </Box>

                <Box id={"pick-upload-button-box"}>
                    <Box id={"pick-files-box"}>
                        <PickFileButton onChange={handleIfcFileChange} StartIcon={<IfcIcon/>} label={"IFC File"}
                                        accept_types={[".ifc"]}/>

                        <PickFileButton onChange={(e) => setObjectPhoto(e.target.files?.[0])} StartIcon={<InsertPhotoIcon/>}
                                        label={"Photo"}
                                        accept_types={[".png"]}/>
                        <PickFileButton onChange={(e) => setEnvironmentalImpactPdf(e.target.files?.[0])} label={"Environmental Statement"}
                                        StartIcon={<ForestIcon/>} accept_types={[".pdf"]}/>

                        <PickFileButton onChange={(e) => setManufacturersBookletPdf(e.target.files?.[0])}
                                        label={"Manufacturer's Booklet"} StartIcon={<AttachFile/>}
                                        accept_types={[".pdf"]}/>
                    </Box>


                    <UploadInspectionRecords inspectionRecords={inspectionRecords}
                                             setInspectionRecords={setInspectionRecords}/>

                    <Box id={"custom-id-and-upload-button-box"}>
                        <TextField onChange={customIdChange} label={"Enter Custom ID"}></TextField>
                        <UploadButton onClick={handleUpload}
                                      disabled={!ifcFileName || fileUploaded || fileUploadError}
                                      fileName={ifcFileName}
                                      fileUploaded={fileUploaded}
                                      fileUploadError={fileUploadError}
                                      fileUpdatedOrCreated={fileUpdatedOrCreated}
                        />
                    </Box>
                </Box>
            </Box>
        </>
    );
}
;