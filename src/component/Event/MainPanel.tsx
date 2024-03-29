import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, SetStateAction } from "react";
import { selectBettingOption } from "../../feature/slices/eventSlice";

import { Box, Typography, CardMedia, Button } from "@mui/material"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import ChartArea from "./ChartArea";
import OrderBook from "./OrderBook";
import Positions from "./Positions";
import BettingOptionButtons from "./BettingOptionButtions";
import MyOrders from './MyOrders';
import { RootState } from "../../app/store";
import { fetchOrders, setBettingOptionLogs } from "../../feature/slices/orderSlice";
import { PublishedEventInfo } from "../../types";

function CustomTabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: Number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function MainPanel({eventInfo}: {eventInfo: PublishedEventInfo}) {
    const dispatch = useDispatch();
    const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey);
    const { orders } = useSelector((state: RootState) => state.orderKey);

    const [moreOrLessSwitch, setMoreOrLessSwitch] = useState(true);
    const [choice, setChoice] = useState(0);

    const handleChange = (_: any, newValue: SetStateAction<number>) => {
        setChoice(newValue);
    };

    useEffect(() => {
        if (selectedBettingOption) {
            console.log(`fetch orders invoked`);
            dispatch(fetchOrders({ bettingOptionUrl: selectedBettingOption.ipfsUrl }) as any);
        }
    }, [selectedBettingOption])

    useEffect(() => {
        async function getResult() {
            if (selectedBettingOption) {
                // once bettingOption selected, then need to calculate tokenId for yes and no tokens.
                fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getEventLogsFor/${selectedBettingOption.ipfsUrl}/OrderFilled`)
                    .then((response) => response.json())
                    .then((res) => {
                        dispatch(setBettingOptionLogs(res.extractedLogs));
                        
                    })
                    .catch(err => {
                        console.error(err);
                    })                
            }
        }
        getResult();
    }, [selectedBettingOption, orders]);

    useEffect(() => {
        if (eventInfo) {
            dispatch(selectBettingOption(eventInfo.bettingOptions[0]) as any);
        }
    }, [eventInfo])

    const [expanded, setExpanded] = useState<string | false>(false);

    const handleExpanded = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
        };
    
    return (
        <Box sx={{ maxWidth: '800px', width: 'calc(100vw - 420px)', marginTop: '2rem' }}>
            <Box>
                <Box sx={{ display: 'flex' }}>
                    <CardMedia
                        sx={{ height: {md: 90, xs:48}, width: {md: 90, xs: 48}, minWidth: {md: 90, xs: 48}, mr: 1}}
                        image={`https://gateway.pinata.cloud/ipfs/${eventInfo.image}`}
                        title={eventInfo.title}
                    />
                    <Box sx={{ width: 1, rowGap: '0.75rem', flexDirection: 'column', display: 'flex' }}>
                        <Box sx={{ display: 'flex', width: 1, gap: '2rem'}}>
                            <Typography sx={{ background: 'lightgray', p: 0.4}}>{eventInfo.category}</Typography>
                            <Typography sx={{ color: 'gray', p: 0.4, display: { md: 'flex', xs: 'none' } }}>${eventInfo.bettingOptions.reduce((sum, bettingOption) => sum + bettingOption.bet, 0)} Bet</Typography>
                            <Typography sx={{ color: 'gray', p: 0.4, display: { md: 'flex', xs: 'none' } }}>Expires {new Date(eventInfo.endDate).toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}</Typography>
                        </Box>
                        <Box sx={{ lineHeight: '32px', fontSize: '32px', display: { md: 'flex', xs: 'none' }}}>{eventInfo.title}</Box>
                    </Box>
                </Box>
                <Box sx={{display: { md: 'none', xs: 'flex' }}}><Typography>{eventInfo.title}</Typography></Box>
            </Box>

            <Box>
            {eventInfo.bettingOptions.length > 1 ? eventInfo.bettingOptions.map((bettingOption) => {
                let isSelected = selectedBettingOption && (bettingOption.ipfsUrl == selectedBettingOption.ipfsUrl);

                return (
                    <Accordion key={bettingOption.ipfsUrl}  expanded={expanded === bettingOption.ipfsUrl} onChange={handleExpanded(bettingOption.ipfsUrl)}>
                        <AccordionSummary>
                            <Button sx={{ display: 'flex', backgroundColor: (isSelected ? '#faebd788' : 'transparent'), width: 1, paddingTop: '0.5rem', paddingBottom: '0.5rem', justifyContent: 'space-between', ":hover": {
                                backgroundColor: '#faebd7cc'
                                }}}  onClick={() => dispatch(selectBettingOption(bettingOption) as any)}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                                    {bettingOption.image ? (<CardMedia
                                        sx={{ height: 44, width:44, minWidth: 44, borderRadius: '100px' }}
                                        image={`https://gateway.pinata.cloud/ipfs/${bettingOption.image}`}
                                        title={bettingOption.title}
                                    />) : null }
                                    <Box sx={{textAlign:'left'}}>
                                        <Typography>{bettingOption.title}</Typography>
                                        <Typography>${bettingOption.bet} Bet</Typography>
                                    </Box>
                                </Box>
                                {bettingOption.result == 0 ? (
                                    <Box sx={{ display:'flex', alignItems: 'center', gap:'0.5rem', justifyContent:'flex-end' }}>
                                        <BettingOptionButtons bettingOption={bettingOption} />
                                    </Box>
                                ) : (
                                    <Box sx={{ display:'flex', alignItems: 'center', gap:'0.5rem', justifyContent:'flex-end' }}>
                                        <CheckCircleIcon/> Result is {bettingOption.result == 1 ? "Yes" : "No"}
                                    </Box>
                                )}
                            </Button>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{width: '100%'}}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                  <Tabs value={choice} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Order Book" {...a11yProps(0)} />
                                    <Tab label="Graph" {...a11yProps(1)} />
                                    <Tab label="My Orders" {...a11yProps(2)} />
                                    <Tab label="Positions" {...a11yProps(3)} />
                                  </Tabs>
                                </Box>
                                <Box sx={{ height: '300px', overflowY: 'scroll' }}>
                                    <CustomTabPanel value={choice} index={0}>
                                        <OrderBook />
                                    </CustomTabPanel>
                                    <CustomTabPanel value={choice} index={1}>
                                        <ChartArea />
                                    </CustomTabPanel>
                                    <CustomTabPanel value={choice} index={2}>
                                        <MyOrders />
                                    </CustomTabPanel>
                                    <CustomTabPanel value={choice} index={3}>
                                        <Positions />
                                    </CustomTabPanel>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )
            }) : (
                <>
                    <ChartArea />
                    <Positions />
                    <Accordion style={{border: '1px solid'}}>
                        <AccordionSummary
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>Order Book</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <OrderBook />
                        </AccordionDetails>
                    </Accordion>
                    <MyOrders />
                </>
            )}
            </Box>
            
            <Box>
                <Typography>About</Typography>
                <hr/>
                <Box>
                    {
                        moreOrLessSwitch ? (<Box sx={{  maxHeight: '2.5rem', overflow: 'hidden' }}>
                        {eventInfo.detail}
                        </Box>) : (<Box>
                            {eventInfo.detail}
                        </Box>)
                    }
                    <Button onClick={() => setMoreOrLessSwitch(!moreOrLessSwitch)}>Show {moreOrLessSwitch ? "more" : "less"} {moreOrLessSwitch ? <KeyboardArrowDownIcon/> : <KeyboardArrowUpIcon/>}</Button>
                </Box>
            </Box>
        </Box>
    )
}