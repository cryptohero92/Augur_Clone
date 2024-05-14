import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState } from "../../app/store";
import { getBettingOptionsPromise } from "../../app/constant";
import { updatePublishedEvent } from "../../feature/slices/eventSlice";
import { PublishedEventInfo } from "../../types";
import PublishedEvent from "./PublishedEvent";
import {
  Box,
  Grid
} from "@mui/material";
  
export default function MainArea() {
const dispatch = useDispatch();
const filter = useSelector((state: RootState) => state.filterKey)
const { publishedEvents } = useSelector((state: RootState) => state.eventKey)
const activeCategories = useSelector((state: RootState) => state.categoryKey.activeList)

const [events, setEvents] = useState<PublishedEventInfo[]>([]);
const today = new Date();

function getWeek(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysSinceFirstDayOfYear = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceFirstDayOfYear + firstDayOfYear.getDay() + 1) / 7);
  
  return weekNumber;
}

function inRange(num: number, min: number, max: number): boolean {
  return (num >= min && num < max) ? true : false;
}

useEffect(() => {
  function getResult() {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/events/publishedUrls`)
      .then(response => response.json())
      .then(({eventUrls}) => {
        (eventUrls as Array<any>).forEach((ipfsUrl, indexInArray) => {
          let item: any = {
            ipfsUrl,
            indexInArray
          };

          fetch(`https://gateway.pinata.cloud/ipfs/${ipfsUrl}`)
            .then((response) => response.json())
            .then(eventInfo => {
              item.title = eventInfo.title
              item.image = eventInfo.image
              item.category = eventInfo.category
              item.endDate = eventInfo.endDate
              getBettingOptionsPromise(eventInfo)
                .then(bettingOptions => {
                  item.bettingOptions = bettingOptions;
                  dispatch(updatePublishedEvent(item as PublishedEventInfo))
                })
            })
            .catch(err => {
              console.error(err);
            })
        });
      })
      .catch(err => {
        debugger
        console.error(err);
      })
  } 
  getResult();
}, [])

useEffect(() => {
  if (publishedEvents && publishedEvents.length > 0) {
    let events = filter.Status == 1 ? publishedEvents.filter(event => event.bettingOptions.reduce((resolved, item) => resolved * item.result, 1) == 0) : filter.Status == 2 ? publishedEvents.filter(event => event.bettingOptions.reduce((resolved, item) => resolved * item.result, 1) != 0) : publishedEvents;

    events = filter.Volume == 1 ? events.filter(event => event.bettingOptions.reduce((total, item) => total + item.bet, 0) < 10000) : filter.Volume == 2 ? events.filter(event => inRange(event.bettingOptions.reduce((total, item) => total + item.bet, 0), 10000, 50000)) : filter.Volume == 3 ? events.filter(event => inRange(event.bettingOptions.reduce((total, item) => total + item.bet, 0), 50000, 100000)) : filter.Volume == 4 ? events.filter(event => event.bettingOptions.reduce((total, item) => total + item.bet, 0) >= 100000) : events; 

    events = filter.EndDate == 1 ? events.filter(event => (new Date(event.endDate)).getDate() == today.getDate()) : filter.EndDate == 2 ? events.filter(event => getWeek(new Date(event.endDate)) == getWeek(today)) : filter.EndDate == 3 ? events.filter(event => (new Date(event.endDate)).getMonth() == today.getMonth()) : events;

    events = activeCategories.length > 0 ? events.filter(event => activeCategories.includes(event.category)) : events;

    setEvents(events);
  }
}, [publishedEvents, filter, activeCategories])

return (
  <Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={2} sx={{p: 2}}>
      {
        events.map((event, index) => <Grid item key={index} xs={12} sm={6} lg={4} xl={3}><PublishedEvent event={event} /></Grid>)
      }
    </Grid>
  </Box>
);
}
  