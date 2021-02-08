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
import useModal from "./useModal";
import TextModal from "./Modal";


function BasicView() {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    const [allowed, setAllowed] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [file, setFile] = React.useState();
    const [fileResults, setFileResults] = React.useState();
    const [percent, setPercent] = React.useState(0);
    const [error, setError] = React.useState(null);
    const [uploadError, setUploadError] = React.useState(null);
    const [convertingError, setConvertingError] = React.useState([]);
    const [filePlainText, setFilePlainText] = React.useState([]);
    const [fileName, setFileName] = React.useState([]);
    const {isShowing, toggle} = useModal();

    const allowedExt = ['pdf', 'txt', 'jpg', 'jpeg', 'gif', 'bmp', 'png'];
    const re = /(?:\.([^.]+))?$/;

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
        setAllowed(true);
        setPercent(0);
    });

    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        onDrop,
    });

    const { ref, ...rootProps } = getRootProps();

    const uploadFile = async () => {
        try {

            const ext = re.exec(file.path)[1];
            const isAllowedExt = allowedExt.indexOf(ext.toLowerCase());
            if (isAllowedExt > -1) {
                setSuccess(false);
                setLoading(true);
                setAllowed(true);
                const formData = new FormData();
                formData.append("file", file);
                formData.append("extension", ext.toLowerCase());
                const Upload_URL = "http://localhost:8080/api/files/upload";
                const response = await axios.put(Upload_URL, formData, {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setPercent(percentCompleted);
                    },
                });

                if (response.data.result !== null) {
                    let fileResult = response.data.result.fileInfoList;
                    fileResult = fileResult.filter(file => file.filename !== 'curl.exe');
                    setFileResults(fileResult);
                    await setPlainText(response, file.name);
                }
                setFilePlainText(response.data.result.plainText.ParsedResults);
                setConvertingError(response.data.result.plainText.ErrorMessage);
                setSuccess(true);
                setLoading(false);
            } else {
                setFile([]);
                setAllowed(false);
                alert('This file type is not supported');
            }
        } catch (err) {
            alert(err.message);
            setLoading(false);
            setUploadError(err.message);
        }
    };

    const getUploadedFiles = async () => {
        try {

            const getAllFile_URL = "http://localhost:8080/api/files/getUploadedFiles";
            await axios.get(getAllFile_URL)
                .then((response) => {
                    let fileResult = response.data.result;
                    fileResult = fileResult.filter(file => file.filename !== 'curl.exe');
                    setFileResults(fileResult);
                    setError(null);
                }).catch((error) => {
                    console.log('Error: ', error);
                    setError(error.toString());
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

    const getPlainText = async (fileName) => {
        try {
            const ext = re.exec(fileName)[1];
            const isAllowedExt = allowedExt.indexOf(ext.toLowerCase());
            if (isAllowedExt > -1) {
            const getAllFile_URL = "http://localhost:8080/api/files/getPlainTextForFile";
            await axios.get(getAllFile_URL, { params: {
                    fileName: fileName,
                    extension: ext.toLowerCase()
                }})
                .then((response) => {
                    if (response.data.result !== null) {
                        setPlainText(response, fileName);
                    }
                }).catch((error) => {
                    console.log('Error: ', error);
                    setConvertingError(error.toString());
                });
            } else {
                alert('This file type is not supported');
            }
        } catch (err) {
            setError(err.toString());
            alert(err.message);
        }
    };

    const setPlainText = async (response, fileName) => {
        if (response.data.result !== null) {
            setFilePlainText(response.data.result.ParsedResults);
            setError(response.data.result.ErrorMessage);
            setFileName(fileName);
            toggle();
        } else {
            const ParsedText = {ParsedText: 'There is no available text for this file !'};
            setFilePlainText([ParsedText]);
            setFileName(fileName);
            toggle();
        }
    };


    return (
        <>
            <TextModal
                isShowing={isShowing}
                hide={toggle}
                plainText={filePlainText}
                file={fileName}
                error={convertingError}
            />
            <Container maxWidth="md" className={classes.inputContainer} style={{ paddingTop: 16 }}>
                <Paper elevation={4}>
                    <Grid container>
                        <Grid item xs={12} className={"uploadedFiles-title"}>
                            <h5 align="center" >
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
                                                {allowed &&

                                                <Fab size="small"
                                                    aria-label="save"
                                                    color="primary"
                                                    className={buttonClassname}
                                                    onClick={uploadFile}
                                                >
                                                    {success ? <CheckIcon /> : <CloudUpload />}
                                                </Fab>
                                                }
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
                                            {uploadError && (
                                                <Typography>
                                                    {uploadError}
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
            {error &&
            <Container maxWidth="md" className={"error-container"}>
                <Paper elevation={4}>
                    <Grid container>
                        <Grid item xs={12} className={"error-title"}>
                            <div>{error}</div>
                        </Grid>
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
        background: "#d8dde0",
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
