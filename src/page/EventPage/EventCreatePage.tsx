import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Select,
    ListSubheader,
    MenuItem,
    FormControl,
    InputLabel,
    CardMedia
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

import { MuiFileInput } from 'mui-file-input';
import { RootState } from "../../app/store";
import DateTimePickerValue, { addMonths } from "../../component/Event/DateTimePickerValue";
import { uploadImage } from "../../component/Event/uploadFile";
import dayjs from 'dayjs';
import BettingOptionsField from "../../component/Event/BettingOptionField";
import { useLocalStorage } from "usehooks-ts";

interface InputState {
    image: string;
    title: string;
    detail: string;
    category: string;
    endDate: dayjs.Dayjs;
    bettingOptions: { title: string; image: string; file: File | null }[];
}

enum Status {
    INITIAL,
    LOADING,
    HAVERESULT
}

enum Result {
    SUCCESS,
    FAILURE
}
  
export default function EventCreate() {
    const navigate = useNavigate();

    const [accessToken] = useLocalStorage<string>('accessToken', '')

    const categories = useSelector((state: RootState) => state.categoryKey.keywords);
    const [bettingOptions, setBettingOptions] = useState([{ title: '', image: null, file: null }]);

    const [inputs, setInputs] = useState<InputState>({
        image: "",
        title: "",
        detail: "",
        category: "",
        endDate: dayjs(addMonths(new Date(), 1).toString()),
        bettingOptions: [{ title: '', image: "", file: null }]
    });
    const [errors, setErrors] = useState({
        image: false,
        title: false,
        detail: false,
        category: false,
        endDate: false
    });
    
    const [imgFile, setImgFile] = useState<File | null>(null);
    const [status, setStatus] = useState(Status.INITIAL);
    const [result, setResult] = useState(Result.SUCCESS);

    function handleChange(e: any) {
        const { name, value } = e.target;
        setInputs((inputs) => ({ ...inputs, [name]: value }));
    }

    function handleDateTimeChange(value: dayjs.Dayjs) {
        setInputs((inputs) => ({...inputs, endDate: value}));
    }
    function handleClose() {
        setStatus(Status.INITIAL);
        navigate("/dashboard");
    }
    function handleFileChange(value: File | null) {
        setImgFile(value);
    }

    function handleValidate(values: InputState) {
        let errors = {} as any;
        let isValid = true;
        if (values["image"] == "") {
            isValid = false;
            errors["image"] = true;
        }
        if (values["title"] == "") {
            isValid = false;
            errors["title"] = true; //"Please enter first name";
        }
        if (values["detail"] == "") {
            isValid = false;
            errors["detail"] = true; //"Please enter last name.";
        }
        if (values["category"] == "") {
            isValid = false;
            errors["category"] = true; //"Please enter email address";
        }
        if (!values["endDate"].isAfter(dayjs())) {
            isValid = false;
            errors["endDate"] = true; //"Please enter email address";
        }
        setErrors(errors);
        return isValid;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (handleValidate(inputs)) {
            setStatus(Status.LOADING);
            let image = inputs.image;
            if (imgFile) {
                image = await uploadImage(imgFile);
            }
            for (let i = 0; i < inputs.bettingOptions.length; i++) {
                if (inputs.bettingOptions[i].file) {
                    inputs.bettingOptions[i].image = await uploadImage(inputs.bettingOptions[i].file as File);
                    inputs.bettingOptions[i].file = null;
                }
            }
            // dispatch(clearResponse());
            // dispatch(addEvent({...inputs, endDate: inputs.endDate.toString(), image}));
            fetch(`${import.meta.env.VITE_BACKEND_URL}/event`, {
                body: JSON.stringify({...inputs, endDate: inputs.endDate.toString(), image}),
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })
                .then((response) => {
                    debugger
                    if (response.status != 200) {
                        throw new Error('withdraw failed')
                    } else {
                        setStatus(Status.HAVERESULT)
                        setResult(Result.SUCCESS)
                    }
                })
                .catch(err => {
                    debugger
                    setStatus(Status.HAVERESULT)
                    setResult(Result.FAILURE)
                    console.error(err)
                });
        }
    }

    return (
        <Box
            sx={{
                mt: '3rem',
                display: "flex",
                flexDirection: 'column',
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Typography sx={{ fontWeight: 600, mb: '2rem' }}>
            Create Event here
            </Typography>
            <form autoComplete="off" onSubmit={handleSubmit}>
                <Box sx={{width: 1, mb:3, display: 'flex'}}>
                    <Box sx={{width: '250px'}}>
                        <MuiFileInput inputProps={{ accept: '.png, .jpeg' }} value={imgFile} onChange={handleFileChange} sx={{width:1}} />
                    </Box>
                    <Box>
                    {inputs.image && (
                        <CardMedia
                            sx={{ height: 80, width:80, minWidth: 80, ml: '1rem' }}
                            image={inputs.image}
                        />
                    )}
                    </Box>
                </Box>
                
                <TextField 
                    label="Title"
                    onChange={handleChange}
                    required
                    variant="outlined"
                    color="secondary"
                    sx={{mb: 3}}
                    fullWidth
                    name="title"
                    value={inputs.title}
                    error={errors.title}
                />
                <TextField 
                    label="Detail"
                    onChange={handleChange}
                    required
                    variant="outlined"
                    color="secondary"
                    name="detail"
                    value={inputs.detail}
                    error={errors.detail}
                    multiline
                    maxRows={7}
                    fullWidth
                    sx={{mb: 3}}
                />
                
                <FormControl sx={{width: 1, mb:3}}>
                    <InputLabel htmlFor="grouped-select">Category</InputLabel>
                    <Select value={inputs.category} onChange={handleChange} label="Category" name="category">
                        {categories.map((category) => [
                            <ListSubheader key={category.name}>{category.name}</ListSubheader>,
                            ...category.subcategories.map((subcategory) => (
                            <MenuItem key={subcategory} value={subcategory}>
                                {subcategory}
                            </MenuItem>
                            ))
                        ])}
                    </Select>
                </FormControl>
                    
                <DateTimePickerValue value={inputs.endDate} onChange={handleDateTimeChange} />
                <BettingOptionsField bettingOptions={bettingOptions} setBettingOptions={setBettingOptions}  />
                
                <Box sx={{display: 'flex', gap: '2rem'}}>
                    <Button 
                        disabled={status == Status.LOADING} 
                        variant="outlined" 
                        color="secondary" 
                        type="submit"
                    >
                        Add Event
                    </Button>
                    <Button 
                        disabled={status == Status.LOADING} 
                        variant="outlined" 
                        color="secondary" 
                        onClick={() => navigate("/dashboard")}
                    >
                        Cancel
                    </Button>
                </Box>
                {
                    status == Status.LOADING && (
                        <CircularProgress size={24} sx={{position:'absolute', top:'50%', left: '50%'}} />
                    )
                }
            </form>
            <Snackbar
                open={status == Status.HAVERESULT}
                autoHideDuration={2000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
                    {result == Result.SUCCESS ? "Event added successfully" : "There was an error to add event"}
                </Alert>
            </Snackbar>
        </Box>
    );
}
  