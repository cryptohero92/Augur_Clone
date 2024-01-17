import {
    Box,
    Grid
  } from "@mui/material";
  import { useSelector } from "react-redux";
  import React, { useState } from "react";
import { RootState } from "../../app/store";
    
  export default function MainArea() {
    const [events, setEvents] = useState([]);
  
    const filter = useSelector((state: RootState) => state.filterKey)
    const activeCategories = useSelector((state: RootState) => state.categoryKey.activeList)
  
    
  
    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2} sx={{p: 2}}>
          Main Area
        </Grid>
      </Box>
    );
  }
    