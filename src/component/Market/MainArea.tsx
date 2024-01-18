import {
  Box,
  Grid
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { RootState } from "../../app/store";
import PLSpeakContract from '../../artifacts/contracts/sepolia/PLSpeakContract.json'
import { updatePublishedEvent } from "../../feature/slices/eventSlice";
import { PublishedEventInfo } from "../../types";
import PublishedEvent from "./PublishedEvent";
  
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

  if (result.data) {
    // after getting event ipfs array from PLSpeakContract, how to get events data. 
    // first after getting events, need to update events of eventSlice. 
    // and compare events with eventSlice's eventList and if there is omitted thing, update event list.
    let filteredEvents = [];

    let eventsData: any[] = result.data as any[];

    // Iterate through the array of IPFS URLs
    for (let i = 0; i < eventsData.length; i++) {
        let ipfsUrl = eventsData[i].ipfsUrl;
        let eventExists = false;

        // Compare the IPFS URL with the predetermined publishedEvents
        for (let j = 0; j < publishedEvents.length; j++) {
            if (ipfsUrl === publishedEvents[j].ipfsUrl) {
                // if resolved changed, then need to update 
                if (eventsData[i].resolved != publishedEvents[j].resolved) {
                  updatePublishedEvent({
                    ...publishedEvents[j],
                    resolved: eventsData[i].resolved
                  })
                }
                eventExists = true;
                break;
            }
        }

        // If there is no match, add the IPFS URL to the filteredEvents array
        if (!eventExists) {
            filteredEvents.push(eventsData[i]);
        }
    }

    // now based on filteredEvents, need to fetch corresponding json content and based on it, update publishedEvents. 

    filteredEvents.forEach(event => {
        // for this event, make new event and dispatch updatePublishedEvents.
        let item: any = {
          ipfsUrl: event.ipfsUrl,
          resolved: event.resolved
        };
        fetch(`https://gateway.pinata.cloud/ipfs/${event.ipfsUrl}`)
          .then((response) => response.json())
          .then(eventInfo => {
            item.title = eventInfo.title
            item.detail = eventInfo.detail
            item.image = eventInfo.image
            item.category = eventInfo.category
            item.endDate = eventInfo.endDate
            let promises = [];
            for (let i = 0; i < eventInfo.bettingOptions.length; i++) {
              promises.push(fetch(eventInfo.bettingOptions[i]).then((response) => response.json()).then(optionInfo => ({
                title: optionInfo.title,
                image: optionInfo.image,
                bet: 0
              })))
            }
            Promise.all(promises)
              .then(bettingOptions => {
                item.bettingOptions = bettingOptions;
                dispatch(updatePublishedEvent(item as PublishedEventInfo))
              })
          })
          .catch(err => {
            console.error(err);
          })
    });
  }
}, [result])

useEffect(() => {
  if (publishedEvents && publishedEvents.length > 0) {
    let events = filter.Status == 1 ? publishedEvents.filter(event => event.resolved == false) : filter.Status == 2 ? publishedEvents.filter(event => event.resolved == true) : publishedEvents;

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
  