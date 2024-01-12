import { Alert, Box, Button, CardMedia, CircularProgress, FormControl, InputLabel, ListSubheader, MenuItem, Select, Snackbar, TextField, Typography } from '@mui/material'

export default function EventCreatePage() {

    return <Box>Event Create Page</Box>

    // return (
    //     <Box
    //         sx={{
    //             mt: '3rem',
    //             display: "flex",
    //             flexDirection: 'column',
    //             justifyContent: "center",
    //             alignItems: "center",
    //         }}
    //     >
    //         <Typography sx={{ fontWeight: 600, mb: '2rem' }}>
    //         Create Event here
    //         </Typography>
    //         <form autoComplete="off" onSubmit={handleSubmit}>
    //             <Box sx={{width: 1, mb:3, display: 'flex'}}>
    //                 <Box sx={{width: '250px'}}>
    //                     <MuiFileInput inputProps={{ accept: '.png, .jpeg' }} value={imgFile} onChange={handleFileChange} sx={{width:1}} />
    //                 </Box>
    //                 <Box>
    //                 {inputs.image && (
    //                     <CardMedia
    //                         sx={{ height: 80, width:80, minWidth: 80, ml: '1rem' }}
    //                         image={inputs.image}
    //                     />
    //                 )}
    //                 </Box>
    //             </Box>
                
    //             <TextField 
    //                 label="Title"
    //                 onChange={handleChange}
    //                 required
    //                 variant="outlined"
    //                 color="secondary"
    //                 sx={{mb: 3}}
    //                 fullWidth
    //                 name="title"
    //                 value={inputs.title}
    //                 error={errors.title}
    //             />
    //             <TextField 
    //                 label="Detail"
    //                 onChange={handleChange}
    //                 required
    //                 variant="outlined"
    //                 color="secondary"
    //                 name="detail"
    //                 value={inputs.detail}
    //                 error={errors.detail}
    //                 multiline
    //                 maxRows={7}
    //                 fullWidth
    //                 sx={{mb: 3}}
    //             />
                
    //             <FormControl sx={{width: 1, mb:3}}>
    //                 <InputLabel htmlFor="grouped-select">Category</InputLabel>
    //                 <Select value={inputs.category} onChange={handleChange} label="Category" name="category">
    //                     {categories.map((category) => [
    //                         <ListSubheader key={category.name}>{category.name}</ListSubheader>,
    //                         ...category.subcategories.map((subcategory) => (
    //                         <MenuItem key={subcategory} value={subcategory}>
    //                             {subcategory}
    //                         </MenuItem>
    //                         ))
    //                     ])}
    //                 </Select>
    //             </FormControl>
                    
    //             <DateTimePickerValue value={inputs.endDate} onChange={handleDateTimeChange} />
                
    //             <TextField 
    //                 label="liquidity"
    //                 onChange={handleChange}
    //                 required
    //                 type="number"
    //                 inputProps={{ min: 0 }}
    //                 variant="outlined"
    //                 color="secondary"
    //                 name="liquidity"
    //                 value={inputs.liquidity}
    //                 error={errors.liquidity}
    //                 fullWidth
    //                 sx={{mb: 3}}
    //             />
    //             <BettingOptionsField initialBettingOptions={initialBettingOptions} setBettingOptions={setBettingOptions}  />
    //             <Box sx={{display: 'flex', gap: '2rem'}}>
    //                 <Button 
    //                     disabled={loading} 
    //                     variant="outlined" 
    //                     color="secondary" 
    //                     type="submit"
    //                 >
    //                     Add Event
    //                 </Button>
    //                 <Button 
    //                     disabled={loading} 
    //                     variant="outlined" 
    //                     color="secondary" 
    //                     onClick={() => navigate("/dashboard")}
    //                 >
    //                     Cancel
    //                 </Button>
    //             </Box>
    //             {
    //                 loading && (
    //                     <CircularProgress size={24} sx={{position:'absolute', top:'50%', left: '50%'}} />
    //                 )
    //             }
    //         </form>
    //         <Snackbar
    //             open={open}
    //             autoHideDuration={2000}
    //             onClose={handleClose}
    //             anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    //         >
    //             <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
    //                 {response === "add" ? "Event added successfully" : error ? error : null}
    //             </Alert>
    //         </Snackbar>
    //     </Box>
    // )
}
