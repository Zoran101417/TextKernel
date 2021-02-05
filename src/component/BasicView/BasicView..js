import React, {useEffect} from "react";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import { useDropzone } from "react-dropzone";
import RootRef from "@material-ui/core/RootRef";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import Fab from "@material-ui/core/Fab";
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from "@material-ui/icons/Check";
import CloudUpload from "@material-ui/icons/CloudUpload";
import clsx from "clsx";
import { LinearProgress } from "@material-ui/core";
import axios from "axios";
import BasicCss from "../BasicView/BasicView.css";


function BasicView() {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [file, setFile] = React.useState();
    const [fileResults, setFileResults] = React.useState();
    const [percent, setPercent] = React.useState(0);

    const buttonClassname = clsx({
        [classes.buttonSuccess]: success,
    });

    useEffect(function persistForm() {
        if (fileResults === undefined) {
            getUploadedFiles().then(r =>{});
        }
    });

    const onDrop = React.useCallback((acceptedFiles) => {
        const fileDropped = acceptedFiles[0];
        setFile(fileDropped);
        setSuccess(false);
        setPercent(0);
    });

    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        onDrop,
    });

    const { ref, ...rootProps } = getRootProps();

    const uploadFile = async () => {
        try {
            setSuccess(false);
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);
            const Upload_URL = "http://localhost:8080/api/files/upload";
            const response = await axios.put(Upload_URL, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setPercent(percentCompleted);
                },
            });
            setFileResults(response.data.result);
            setSuccess(true);
            setLoading(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const getUploadedFiles = async () => {
        try {

            const getAllFile_URL = "http://localhost:8080/api/files/getUploadedFiles";
            await axios.get(getAllFile_URL)
                .then((response) => {
                    setFileResults(response.data.result);
                }).catch((error) => {
                    console.log('Error: ', error);
                });
        } catch (err) {
            alert(err.message);
        }
    };

    const renderTableData  = () => {
        if (fileResults !== undefined){
            return fileResults.map((file, index) => {
                const { id, filename, fileDownloadUri, size } = file;
                return (
                    <tr key={index}>
                        <td>{index+1}</td>
                        <td>{filename}</td>
                        <td>{size} KB</td>
                        <td><IconButton size="small"
                                 aria-label="save"
                                 title="Plain text"
                                 color="primary"
                                 onClick={() => getPlainText(filename)}>
                            <CheckIcon />
                        </IconButton></td>
                    </tr>
                )
            })
        }
    };

    const getPlainText = async (filename) => {
        // Unfortunately here i get error from api :
        // Please check if the file has sufficient permissions and allows access and is not corrupt.
        // I try to solve it with some library like ocr-space-api and ocr-space-api-alt2 but unsuccessful
        // Same error i get on backend solution also :(

        const API_URL1 = "https://api.ocr.space/parse/imageurl?";
        const apiKey = 'apikey=5b61727e1588957';
        const fileUrl = '&url='+filename;
        const lang = '&language=eng';
        const filetype = '&filetype=pdf';
        const isOverlayRequired = '&isOverlayRequired=false';
        const full_Url = API_URL1 + apiKey + fileUrl + lang + filetype + isOverlayRequired;

        try {

            fetch(full_Url)
                .then(res => res.json())
                .then(
                    (result) => {
                        console.log('result fetch:', result);
                        alert(result.ParsedResults[0]);
                    },
                    (error) => {
                        console.log('error: ', error);
                    }
                )
            } catch (e) {
                console.log('exception: ', e);
            }
    };

    return (
        <>

            <Container maxWidth="md" className={classes.inputContainer}>
                <Paper elevation={4}>
                    <Grid container>
                        <Grid item xs={12}>
                            <h5 align="center">
                                File Upload
                            </h5>
                            <Divider />
                        </Grid>

                        <Grid item xs={6} style={{ padding: 23 }}>
                            <RootRef rootRef={ref}>
                                <Paper
                                    {...rootProps}
                                    elevation={0}
                                    className={classes.importContainer}
                                >
                                    <input {...getInputProps()} />
                                    <p>Click to select files or drag 'n' drop them here</p>
                                </Paper>
                            </RootRef>
                        </Grid>

                        <Grid item xs={6} style={{ padding: 16 }}>
                            {file && (
                                <>
                                    <Grid
                                        container
                                        alignItems="center"
                                        spacing={3}
                                    >
                                        <Grid item xs={2}>
                                            <div className={classes.wrapper}>
                                                <Fab size="small"
                                                    aria-label="save"
                                                    color="primary"
                                                    className={buttonClassname}
                                                    onClick={uploadFile}
                                                >
                                                    {success ? <CheckIcon /> : <CloudUpload />}
                                                </Fab>
                                                {loading && (
                                                    <CircularProgress
                                                        size={48}
                                                        className={classes.fabProgress}
                                                    />
                                                )}
                                            </div>
                                        </Grid>

                                        <Grid item xs={10}>
                                            {file && (
                                                <Typography variant="body">{file.name}</Typography>
                                            )}
                                            {loading && (
                                                <div>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percent}
                                                    />
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Typography variant="body">{percent}%</Typography>
                                                    </div>
                                                </div>
                                            )}

                                            {success && (
                                                <Typography>
                                                    File Upload Success!{" "}
                                                </Typography>
                                            )}

                                        </Grid>
                                    </Grid>
                                </>
                            )}
                            {/*  */}
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
            {fileResults &&
                <Container maxWidth="md" className={"upload-container"}>
                    <Paper elevation={4}>
                        <Grid container>
                            <Grid item xs={12} className={"uploadedFiles-title"}>
                                <h5 align="center">
                                    Uploaded Files
                                </h5>
                                <Divider />
                            </Grid>

                            <table id='fileInfo'>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>File Name</th>
                                    <th>Size</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {renderTableData()}
                                </tbody>
                            </table>
                    </Grid>
                    </Paper>
                </Container>
            }
        </>
    );
}

export default BasicView;

const useStyles = makeStyles((theme) => ({
    importContainer: {
        paddingTop: 10,
        height: 30,
        background: "#d0d0d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "groove",
        borderColor: "#bcbcbc",
        cursor: "pointer",
    },
        wrapper: {
        margin: theme.spacing(1),
        position: "relative",
    },
        buttonSuccess: {
        backgroundColor: green[500],
        "&:hover": {
        backgroundColor: green[700],
         },
    },
        fabProgress: {
        color: green[500],
        position: "absolute",
        top: -5,
        left: -4,
        zIndex: 1,
    },
        buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
}));
