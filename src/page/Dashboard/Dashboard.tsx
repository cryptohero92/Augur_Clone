import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material'
import { Link } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { readContract, readContracts } from "@wagmi/core";
import UnPublishedEvent from "../../component/Event/UnPublishedEvent";
import EventReporter from "../../component/Event/EventReporter";
import { updatePublishedEvent } from "../../feature/slices/eventSlice";
import { RootState } from "../../app/store";
import { config } from "../../wagmi";
import CTFExchangeContract from "../../../../backend/src/artifacts/contracts/papaya/CTFExchangeContract.json"
import { BigNumberish, formatUnits } from 'ethers'
import { PublishedEventInfo } from "../../types";

export default function Dashboard() {
    // first need to get all events. these events are from mongodb.
    const dispatch = useDispatch();
    const [events, setEvents] = useState([])
    const [affairs, setAffairs] = useState([])
    const { publishedEvents } = useSelector((state: RootState) => state.eventKey)

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
                      item.detail = eventInfo.detail
                      item.image = eventInfo.image
                      item.category = eventInfo.category
                      item.endDate = eventInfo.endDate
                      let promises = [];
                      for (let i = 0; i < eventInfo.bettingOptions.length; i++) {
                        const contractPromise = readContracts(config, {
                          contracts: [
                            {
                              abi: CTFExchangeContract.abi,
                              address: CTFExchangeContract.address as `0x${string}`,
                              functionName: 'getBetAmountOfBettingOption',
                              args: [eventInfo.bettingOptions[i]] 
                            },
                            {
                              abi: CTFExchangeContract.abi,
                              address: CTFExchangeContract.address as `0x${string}`,
                              functionName: 'getResultOfBettingOption',
                              args: [eventInfo.bettingOptions[i]]
                            }
                          ]                  
                        }).then(res => ({
                          ipfsUrl: eventInfo.bettingOptions[i],
                          bet: Number(formatUnits(res[0].result as BigNumberish, 6)),
                          result: Number(res[1].result)
                        }))

                        const ipfsPromise = fetch(`https://gateway.pinata.cloud/ipfs/${eventInfo.bettingOptions[i]}`).then((response) => response.json()).then(optionInfo => ({
                          title: optionInfo.title,
                          image: optionInfo.image
                        }));

                        promises.push(Promise.all([contractPromise, ipfsPromise])
                          .then((results) => (Object.assign({}, ...results)))) 
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

    useEffect(() => {
        // setAffairs(publishedEvents.filter(event => event.bettingOptions.reduce((resolved, item) => resolved * item.result, 1) == 0));
        setAffairs(publishedEvents);
    }, [publishedEvents])

    return (
        <Box>
            <Box>
                <Typography>
                    ==== Unpublished Events ===
                </Typography>
            </Box>
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

            <Box sx={{mt: 5}}>
                <Typography>
                    ==== Published Events ===
                </Typography>
            </Box>

            <Box
                sx={{ flexGrow: 1 }}
            >
                
                {affairs.length == 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Typography>No Published Events</Typography></Box>
                ): (
                    <Grid container spacing={2} sx={{p: 2}}>
                        {affairs.map((event, index) => (
                            <Grid item key={index} xs={12} sm={6} lg={4} xl={3}>
                                <EventReporter event={event} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    )
}
