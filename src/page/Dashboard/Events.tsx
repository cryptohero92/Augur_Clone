import { useDispatch } from "react-redux";
import { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material'
import { Link } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import UnPublishedEvent from "../../component/Event/UnPublishedEvent";
import { updatePublishedEvent } from "../../feature/slices/eventSlice";
import { PublishedEventInfo } from "../../types";
import { getBettingOptionsPromise } from "../../app/constant";

export default function Events() {
    // first need to get all events. these events are from mongodb.
    const dispatch = useDispatch();
    const [events, setEvents] = useState([])

    const getAllEvents = () => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/events`)
			.then((response) => response.json())
			// If yes, retrieve it. If no, create it.
			.then((events) =>
				setEvents(events)
			)
			.catch((err: any) => {
                console.error(err)
            });
    }

    const removeEvent = (eventId: any) => {
        setEvents((events) => {
            return events.filter(
                (event: any) => event._id != eventId
            );
        });
        updatePublishedEventList();
    }

    function updatePublishedEventList() {
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

    useEffect(() => {
        getAllEvents();
        updatePublishedEventList();
    }, [])

    return (
        <Box>
            <Box sx={{p: 2, width: 1}}>
                <Link to="/dashboard/create">
                    <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleIcon />}
                    >
                        Create Event
                    </Button>
                </Link>
                <Link to="/dashboard/categories">
                    <Button
                    variant="contained"
                    color="primary"
                    >
                        Categories
                    </Button>
                </Link>
            </Box>
            <Box
                sx={{ flexGrow: 1 }}
            >
                
                {events.length == 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Typography>No Events</Typography></Box>
                ): (
                    <Grid container spacing={2} sx={{p: 2}}>
                        {events.map((event, index) => (
                            <Grid item key={index} xs={12} sm={6} lg={4} xl={3}>
                                <UnPublishedEvent event={event} removeEvent={removeEvent} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    )
}
