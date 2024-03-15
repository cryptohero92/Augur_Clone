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
import MyOrders from './MyOrders';
import { RootState } from "../../app/store";
import { fetchOrders } from "../../feature/slices/orderSlice";
import { BettingOptionInfo, OrderInfo, PublishedEventInfo } from "../../types";
import { readContracts } from "@wagmi/core";
import CTFExchangeContract from "../../../../backend/src/artifacts/contracts/papaya/CTFExchangeContract.json"
import { config } from "../../wagmi";

function CustomTabPanel(props) {
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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function BettingOptionButtons({ipfsUrl, yesTokenId, noTokenId}: {ipfsUrl: string, yesTokenId: string, noTokenId: string}) {
    const [yesValue, setYesValue] = useState(50);
    const [noValue, setNoValue] = useState(50);
    
    const { orders } = useSelector((state: RootState) => state.orderKey);

    useEffect(() => {
        if (ipfsUrl) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/orders?bettingOptionUrl=${ipfsUrl}`)
                .then((response) => {
                    if (response.status != 200) {
                        throw new Error('Error happened')
                    } else {
                        return response.json()
                    }
                })
                // If yes, retrieve it. If no, create it.
                .then((res) => {
                    let orders = res.orders as OrderInfo[];
                    if (!orders || !orders.length) {
                        setYesValue(50);
                        setNoValue(50);
                        return;
                    }

                    let _yesOrders = orders.map(order => {
                        const {tokenId, makerAmount, takerAmount, status, side, bettingStyle, ...rest} = order;
                        let price = bettingStyle == 'LIMITED' ? (side == 0 ? makerAmount * 100 / takerAmount: takerAmount * 100 / makerAmount) : (status.remaining > 0 && status.remaining < takerAmount ? (side == 0 ? 99.9 : 0.1) : (side == 0 ? makerAmount * 100 / takerAmount : takerAmount * 100 / makerAmount));

                        if (tokenId == yesTokenId) return {
                            price,
                            side,
                            ...rest
                        }
                        else return {
                            price: 100 - price,
                            side: 1 - side,
                            ...rest
                        }
                    });

                    const sellOrders = _yesOrders.filter(order => order.side == 1).sort((a, b) => a.price - b.price);
                    const buyOrders = _yesOrders.filter(order => order.side == 0).sort((a, b) => b.price - a.price);
            
                    if (buyOrders.length > 0)
                        setNoValue(100 - buyOrders[0].price);
                    if (sellOrders.length > 0)
                        setYesValue(sellOrders[0].price);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [ipfsUrl, orders])

    return (
        <>
            <Box sx={{ width: '150px', height: '48px', display:'flex', placeContent: 'center', alignItems: 'center', backgroundColor: '#27ae601a', color: 'green'}}>Buy Yes {yesValue}¢</Box>
            <Box sx={{ width: '150px', height: '48px', display:'flex', placeContent: 'center',alignItems: 'center', backgroundColor: '#eb57571a', color: 'red'}}>Buy No {noValue}¢</Box>
        </>
    )
}

export default function MainPanel({eventInfo}: {eventInfo: PublishedEventInfo}) {
    const dispatch = useDispatch();
    const { selectedBettingOption } : { selectedBettingOption: BettingOptionInfo | null } = useSelector((state: RootState) => state.eventKey);

    const [moreOrLessSwitch, setMoreOrLessSwitch] = useState(true);
    const [choice, setChoice] = useState(0);
    const [yesTokenId, setYesTokenId] = useState('0');
    const [noTokenId, setNoTokenId] = useState('0');

    const handleChange = (_: any, newValue: SetStateAction<number>) => {
        setChoice(newValue);
    };

    useEffect(() => {
        if (selectedBettingOption) {
            console.log(`fetch orders invoked`);
            dispatch(fetchOrders({ bettingOptionUrl: selectedBettingOption.ipfsUrl }));

            readContracts(config, {
                contracts: [
                  {
                    abi: CTFExchangeContract.abi,
                    address: CTFExchangeContract.address as `0x${string}`,
                    functionName: 'getTokenIdFrom',
                    args: [selectedBettingOption.ipfsUrl, true]
                  },
                  {
                    abi: CTFExchangeContract.abi,
                    address: CTFExchangeContract.address as `0x${string}`,
                    functionName: 'getTokenIdFrom',
                    args: [selectedBettingOption.ipfsUrl, false]
                  }
                ]                  
              }).then(res => {
                  setYesTokenId(res[0].result.toString());
                  setNoTokenId(res[1].result.toString());
              });
        }
    }, [selectedBettingOption])

    useEffect(() => {
        if (eventInfo) {
            dispatch(selectBettingOption(eventInfo.bettingOptions[0]));
        }
    }, [eventInfo])

    const [expanded, setExpanded] = useState<string | false>(false);

    const handleExpanded = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
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
                                }}}  onClick={() => dispatch(selectBettingOption(bettingOption))}>
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
                                        <BettingOptionButtons ipfsUrl={bettingOption.ipfsUrl} yesTokenId={yesTokenId} noTokenId={noTokenId} />
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
                                  </Tabs>
                                </Box>
                                <Box sx={{ height: '300px', overflowY: 'scroll' }}>
                                    <CustomTabPanel value={choice} index={0}>
                                        <OrderBook yesTokenId={yesTokenId} noTokenId={noTokenId} />
                                    </CustomTabPanel>
                                    <CustomTabPanel value={choice} index={1}>
                                        <ChartArea />
                                    </CustomTabPanel>
                                    <CustomTabPanel value={choice} index={2}>
                                        <MyOrders yesTokenId={yesTokenId} />
                                    </CustomTabPanel>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                )
            }) : (
                <>
                    <ChartArea />
                    <Accordion style={{border: '1px solid'}}>
                        <AccordionSummary
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>Order Book</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <OrderBook yesTokenId={yesTokenId} noTokenId={noTokenId} />
                        </AccordionDetails>
                    </Accordion>
                    <MyOrders yesTokenId={yesTokenId} />
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