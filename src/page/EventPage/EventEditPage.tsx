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
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import dayjs from 'dayjs';
import DateTimePickerValue, { addMonths } from "../../component/Event/DateTimePickerValue";
import { MuiFileInput } from 'mui-file-input';
import BettingOptionsField from "../../component/Event/BettingOptionField";
import { uploadImage } from "../../component/Event/uploadFile";
import { useLocalStorage } from "usehooks-ts";
import { RootState } from "../../app/store";
import { InputState, Result, Status } from "../../types";

export default function EventEdit() {
  const { eventID } = useParams();
  const navigate = useNavigate();
  const [accessToken] = useLocalStorage<string>('accessToken', '')

  const categories = useSelector((state: RootState) => state.categoryKey.keywords);
  const [bettingOptions, setBettingOptions] = useState([{ title: '', description: '', image: '', file: null }]);

  const [inputs, setInputs] = useState<InputState>({
    image: "",
    title: "",
    category: "",
    endDate: dayjs(addMonths(new Date(), 1).toString()),
    bettingOptions: [{ title: '', description: "", image: "", file: null }]
  });

  const [errors, setErrors] = useState({
    image: false,
    title: false,
    category: false,
    endDate: false
  });
  
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [status, setStatus] = useState(Status.INITIAL);
  const [result, setResult] = useState(Result.SUCCESS);

  // fetch special event by using eventID, and based on it, set inputs.
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/events/${eventID}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then((response) => response.json())
        .then((event: any) => {
            let {image, title, category, endDate, bettingOptions} = event
            setInputs({
                image,
                title,
                category,
                endDate: dayjs(new Date(endDate).toString()),
                bettingOptions
            });
            setBettingOptions(bettingOptions.map((option: any) => ({...option, file: null})))
        })
        .catch((err: any) => {
            console.error(err)
        });
  }, [eventID])

  useEffect(() => {
      handleValidate(inputs);
  }, [inputs]);

  useEffect(() => {
      setInputs((inputs) => ({...inputs, category: categories[0].subcategories[0].name}))
  }, [categories])

  useEffect(() => {
      if (imgFile) {
          setInputs((inputs) => ({...inputs, image: URL.createObjectURL(imgFile)}));
      }
  }, [imgFile]);

  useEffect(() => {
      setInputs((inputs) => ({...inputs, bettingOptions: bettingOptions}));
  }, [bettingOptions])

  function handleChange(e: any) {
      const { name, value } = e.target;
      setInputs((inputs) => ({ ...inputs, [name]: value }));
  }

  function handleDateTimeChange(value: dayjs.Dayjs) {
    setInputs((inputs) => ({...inputs, endDate: value}));
  }
  function handleFileChange(value: File | null) {
    setImgFile(value);
  }

  async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (handleValidate(inputs)) {
        setStatus(Status.LOADING);
        let image = inputs.image;
        if (imgFile) {
            image = await uploadImage(imgFile);
        }
        debugger
        if (inputs.bettingOptions.length == 1) {
            inputs.bettingOptions[0].title = inputs.title;
        }
        for (let i = 0; i < inputs.bettingOptions.length; i++) {
            if (inputs.bettingOptions[i].file) {
                inputs.bettingOptions[i].image = await uploadImage(inputs.bettingOptions[i].file as File);
                inputs.bettingOptions[i].file = null;
            }
        }
        // dispatch(clearResponse());
        // dispatch(modifiedEvent({...inputs, endDate: inputs.endDate.toString(), image, id: eventID}));

        fetch(`${import.meta.env.VITE_BACKEND_URL}/events/${eventID}`, {
            body: JSON.stringify({...inputs, endDate: inputs.endDate.toString(), image}),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            method: 'PATCH',
        })
          .then((response) => {
              if (response.status != 200) {
                  throw new Error('withdraw failed')
              } else {
                  setStatus(Status.HAVERESULT)
                  setResult(Result.SUCCESS)
              }
          })
          .catch(err => {
              setStatus(Status.HAVERESULT)
              setResult(Result.FAILURE)
              console.error(err)
          });
      }
  }

  function handleClose() {
    setStatus(Status.INITIAL);
    navigate("/dashboard");
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
          <Typography sx={{ fontWeight: 600 }}>
              Update Event here
          </Typography>
          <form autoComplete="off" onSubmit={handleSubmit}>
              <Box sx={{width: 1, mb:3, display: 'flex'}}>
                  <Box sx={{width: 0.5}}>
                      <MuiFileInput inputProps={{ accept: '.png, .jpeg' }} value={imgFile} onChange={handleFileChange} sx={{width:1}} />
                  </Box>
                  <Box>
                  {inputs.image && (
                      (<CardMedia
                          sx={{ height: 80, width:80, minWidth: 80, ml: '1rem' }}
                          image={inputs.image}
                      />)
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
              
              <FormControl sx={{width: 1, mb:3}}>
                  <InputLabel htmlFor="grouped-select">Category</InputLabel>
                  <Select value={inputs.category} onChange={handleChange} label="Category" name="category">
                      {categories.map((category) => [
                          <ListSubheader key={category.name}>{category.name}</ListSubheader>,
                          ...category.subcategories.map((subcategory) => (
                          <MenuItem key={subcategory.name} value={subcategory.name}>
                              {subcategory.name}
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
                    Save
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
                {result == Result.SUCCESS ? "Event modified successfully" : "There was an error to modify event"}
              </Alert>
          </Snackbar>
      </Box>
  );
}
