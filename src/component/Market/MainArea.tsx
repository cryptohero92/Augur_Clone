import {
  Box,
  Grid
} from "@mui/material";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { RootState } from "../../app/store";
import PLSpeakContract from '../../artifacts/contracts/sepolia/PLSpeakContract.json'
  
export default function MainArea() {
const [events, setEvents] = useState([]);

const filter = useSelector((state: RootState) => state.filterKey)
const activeCategories = useSelector((state: RootState) => state.categoryKey.activeList)

// how to get events from PLSpeakContract.
// PLSpeakContract contains getEvents function.
const result = useReadContract({
  abi: PLSpeakContract.abi,
  address: PLSpeakContract.address as `0x${string}`,
  functionName: 'getEvents'
});

useEffect(() => {
  // get json content from hash code.
  console.log(result);
  
  // `https://magenta-mere-mouse-500.mypinata.cloud/ipfs/${}`
  
  // events = filter.EndDate == 1 ? events.filter(event => (new Date(event.endDate)).getDate() == today.getDate()) : filter.EndDate == 2 ? events.filter(event => getWeek(new Date(event.endDate)) == getWeek(today)) : filter.EndDate == 3 ? events.filter(event => (new Date(event.endDate)).getMonth() == today.getMonth()) : events;

  // events = activeCategories.length > 0 ? events.filter(event => activeCategories.includes(event.category)) : events;

}, [result])



return (
  <Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={2} sx={{p: 2}}>
      Main Area
    </Grid>
  </Box>
);
}
  