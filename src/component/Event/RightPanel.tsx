import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Box, Typography, Button } from "@mui/material"
import QuantityInput from "./QuantityInput"
import ConnectKitCustomButton from "./ConnectKitCustomButton";
import BettingStyleSelectMenu from "./BettingStyleSelectMenu";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BettingStyle } from "../../Const";
import { sendOrderRequest } from '../Slices/orderSlice';
import { fetchUserTokens } from '../Slices/eventSlice';
import { BUY, SELL, mergeElements } from "../../app/constant";
import { setShowNo } from '../Slices/orderSlice';

export default function RightPanel() {
    const dispatch = useDispatch();
    const ref = useRef();

    const [currentMoney] = useLocalStorage<number>('currentMoney', 0)

    const { orders, showNo } = useSelector((state) => state.orderKey);
    const { selectedBettingOption } = useSelector((state) => state.eventKey);
    const { correspondingAddress } = useSelector((state: RootState) => state.userKey);

    const [bettingStyle, setBettingStyle] = useState(BettingStyle.Limit);
    const [buyOrSell, setBuyOrSell] = useState(BUY);
    const [yesValue, setYesValue] = useState(50);
    const [noValue, setNoValue] = useState(50);
    const [yesShares, setYesShares] = useState(0);
    const [noShares, setNoShares] = useState(0);
    const [avgValue, setAvgValue] = useState(0.1);
    const [predictedShares, setPredictedShares] = useState(0);
    const [amount, setAmount] = useState(0);
    const [estimatedAmountReceived, setEstimatedAmountReceived] = useState(0);
    const [limitPrice, setLimitPrice] = useState(0);
    const [shares, setShares] = useState(0);

    const [accessToken, setAccessToken] = useLocalStorage<string>('accessToken', '')
    const handleLoggedIn = (auth: Auth) => {
        console.log(auth)
        const { accessToken } = auth;
        setAccessToken(accessToken);
    };
    

    const handleBuySellClick = () => {
        dispatch(sendOrderRequest({
            selectedBettingOption, bettingStyle, buyOrSell, yesOrNo: !showNo, amount, limitPrice, shares, correspondingAddress
        }));
    }

    const onYesButtonClicked = () => {
        if (ref.current) {
            ref.current.updateInputValue(yesValue);    
        }
        dispatch(setShowNo(false));
    }

    const onNoButtonClicked = () => {
        if (ref.current) {
            ref.current.updateInputValue(noValue);    
        }
        dispatch(setShowNo(true));   
    }

    const handleAmountChange = (value) => {
        setAmount(Number(value));
    }

    const handleSharesChange = (value) => {
        setShares(Number(value));
    }

    const handleLimitPriceChange  = (value) => {
        setLimitPrice(Number(value));
    }

    function roundToTwo(num) {
        return +(Math.round(num + "e+2")  + "e-2");
    }

    
    useEffect(() => {
        if (tokens && tokens.length > 0) {
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].yesOrNo)
                    setYesShares(tokens[i].shares);
                else
                    setNoShares(tokens[i].shares);
            }
        }
    }, [tokens]);

    useEffect(() => {
        if (!orders || !orders.length) return;
        let _orders = orders;
        if (showNo) {
          _orders = _orders.map(order => {
            const {price, buyOrSell, ...rest} = order;
            return {
              price: 100 - price,
              buyOrSell: !buyOrSell,
              ...rest
            };
          });
        }

        const sellOrders = mergeElements(_orders.filter(order => order.buyOrSell == SELL).sort((a, b) => a.price - b.price));
        
        let predictedShares = 0;
        let remain = amount;
        let avgValue = 100;

        if (sellOrders.length > 0) {
            for (let i = 0; i < sellOrders.length; i++) {
                let order = sellOrders[i];
                if (remain >= order.price * order.shares) {
                    predictedShares += order.shares;
                    remain -= order.price * order.shares;
                } else {
                    // if have no sufficient money to get all, so need to get some parts only
                    predictedShares += remain / order.price;
                    remain = 0;
                    break;
                }
            }
            if (remain == 0) {
                avgValue = amount / predictedShares;
            }
        }
        setPredictedShares(predictedShares);
        setAvgValue(avgValue);
    }, [amount]);

    useEffect(() => {
        if (!orders || !orders.length) return;
        let _orders = orders;
        if (showNo) {
          _orders = _orders.map(order => {
            const {price, buyOrSell, ...rest} = order;
            return {
              price: 100 - price,
              buyOrSell: !buyOrSell,
              ...rest
            };
          });
        }
        const buyOrders = mergeElements(_orders.filter(order => order.buyOrSell == BUY).sort((a, b) => b.price - a.price));
        let remainingShares = shares;
        let amountReceived = 0;
        let avgValue = 0;

        if (buyOrders.length > 0) {
            for (let i = 0; i < buyOrders.length; i++) {
                let order = buyOrders[i];
                if (remainingShares >= order.shares) {
                    amountReceived += order.shares * order.price;
                    remainingShares -= order.shares;
                } else {
                    amountReceived += remainingShares * order.price;
                    remainingShares = 0;
                    break;
                }
            }
            if (remainingShares == 0) {
                avgValue = amountReceived / shares;
            }
        }
        
        setAvgValue(avgValue);
        setEstimatedAmountReceived(amountReceived);
    }, [shares]);

    useEffect(() => {
        if (!orders || !orders.length) {
            setYesValue(50);
            setNoValue(50);
            return;
        }
        // if yes, then, show 
        const buyOrders = mergeElements(orders.filter(order => order.buyOrSell == BUY).sort((a, b) => b.price - a.price)).reverse();
        const sellOrders = mergeElements(orders.filter(order => order.buyOrSell == SELL).sort((a, b) => a.price - b.price));

        if (buyOrders.length > 0) {
            setNoValue(100 - buyOrders.at(-1).price);
        }
        if (sellOrders.length > 0)
            setYesValue(sellOrders[0].price);

        // if (buyOrders.length == 0) {
        //     setNoValue(100 - sellOrders.at(-1).price);
        // } else if (sellOrders.length == 0) {
        //     setYesValue(buyOrders[0].price);
        // }
        
      }, [orders]);

    const styles = {
        panel: {
            position: 'sticky',
            maxWidth: '340px',
            minWidth: '340px',
            width: '340px',
            marginTop: '2rem',
            height: 'fit-content'
        },
        container: {
            borderRadius: '12px',
            border: '1px solid gray',
            display:'flex',
            rowGap: '1.5rem',
            flexDirection: 'column'
        },
        outcomeBox: {
            borderBottom: '1px solid'
        },
        outcomeButtons: {
            display: 'flex',
            padding: '1.5rem',
            paddingBottom: '0.5rem',
            gap: '1.5rem'
        },
        yesButton: {
            backgroundColor:(showNo == false ? 'green':'lightgreen'),
            color: 'white',
            width: 1,
            marginRight: '4px',
            ":hover": {
                backgroundColor: 'green'
            }
        },
        noButton: {
            backgroundColor: (showNo == false ? 'lightgrey' : 'grey'),
            color: 'white',
            width: 1,
            marginLeft: '4px',
            ":hover": {
                backgroundColor: 'grey'
            }
        },
        amountBox: {
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            paddingTop: '0.5rem',
            rowGap: '1rem'
        },
        avgPriceBox: {
            display: 'flex',
            width: 1,
            justifyContent: 'space-between'
        },
        sharesBox: {
            display: 'flex',
            width: 1,
            justifyContent: 'space-between'
        },
        potentialReturnBox: {
            display: 'flex',
            width: 1,
            justifyContent: 'space-between'
        },
        estAmountReceivedBox: {
            display: 'flex',
            width: 1,
            justifyContent: 'space-between'
        },
        checkCircleIconBox: {
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            alignItems: 'center',
            gap: '1.5rem',
            color: 'rgb(25, 118, 210)'
        }
    };

    return (
        <Box sx={styles.panel}>
            <Box sx={styles.container}>
                {selectedBettingOption ? (
                    selectedBettingOption.result == 0 ? (
                        <>
                            <Box sx={{borderBottom: '1px solid'}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                                    <Box sx={styles.outcomeButtons}>
                                        <Box sx={{ color: buyOrSell == BUY ? 'blue': 'gray'}} onClick={() => setBuyOrSell(BUY)} >Buy</Box>
                                        <Box sx={{ color: buyOrSell == BUY ? 'gray': 'blue'}} onClick={() => setBuyOrSell(SELL)}>Sell</Box>
                                    </Box>
                                    <BettingStyleSelectMenu  bettingStyle={bettingStyle} setBettingStyle={setBettingStyle} />
                                </Box>
                            </Box>  
                            
                            <Box sx={styles.amountBox}>
                                <Box sx={{display: 'flex', flexDirection: 'column', rowGap: '0.5rem'}}>
                                    <Box><Typography>Outcome</Typography></Box>
                                    <Box sx={{display: 'flex'}}>
                                        <Button sx={styles.yesButton} onClick={() => onYesButtonClicked()}>Yes {yesValue}¢</Button>
                                        <Button sx={styles.noButton} onClick={() => onNoButtonClicked()}>No {noValue}¢</Button>
                                    </Box>
                                    <Box sx={{display: 'flex'}}>
                                        <Box sx={{width: 1, color: 'green'}}>{yesShares} shares</Box>
                                        <Box sx={{width: 1, color: 'orange'}}>{noShares} shares</Box>
                                    </Box>
                                </Box>
                                {bettingStyle == BettingStyle.Market && (
                                    <>
                                        <Box sx={{display: 'flex', flexDirection: 'column' }}>
                                            {buyOrSell == BUY ? (
                                                <>
                                                    <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                                                        <Typography>Amount($)</Typography>
                                                        <Typography>Balance: ${currentMoney}</Typography>
                                                    </Box>
                                                    <QuantityInput ref={ref} changeValue={handleAmountChange} />
                                                </>
                                            ) : (
                                                <>
                                                    <Typography>Shares</Typography>
                                                    <QuantityInput changeValue={handleSharesChange} />
                                                </>
                                            )}
                                        </Box>

                                        {accessToken != undefined && accessToken != '' ? (
                                            <Button sx={{ backgroundColor: '#ee001299', color: 'white', ":hover": {
                                              backgroundColor: '#ee0012bb'
                                            }}} onClick={handleBuySellClick}>{buyOrSell == BUY ? 'Buy' : 'Sell'}</Button>
                                        ) : (
                                            <Login handleLoggedIn={handleLoggedIn} />
                                        )}

                                        <Box sx={{display: 'flex', rowGap: '0.25rem', flexDirection: 'column'}}>
                                            <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                <Typography>Avg Price</Typography>
                                                <Typography>{avgValue}¢</Typography>
                                            </Box>
                                            { buyOrSell == BUY ? (
                                                <>      
                                                    <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                        <Typography>Shares</Typography>
                                                        <Typography>{roundToTwo(predictedShares)}</Typography>
                                                    </Box>
                                                    <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                        <Typography>Potential Return</Typography>
                                                        <Typography>${roundToTwo(amount/avgValue * 100)}({ roundToTwo((100/avgValue - 1) * 100) }%)</Typography>
                                                    </Box>
                                                </>
                                            ) : (
                                                <>
                                                    <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                        <Typography>Est. Amount Received</Typography>
                                                        <Typography>${roundToTwo(estimatedAmountReceived)}</Typography>
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                    </>
                                )}
                                {bettingStyle == BettingStyle.Limit && (
                                    <>
                                        <Box sx={{display: 'flex', flexDirection: 'column', rowGap:'0.5rem' }}>
                                            <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                                                <Typography>Limit Price</Typography>
                                                {buyOrSell == BUY && (
                                                    <Typography>Balance: {currentMoney}</Typography>
                                                )}
                                            </Box>
                                            <QuantityInput ref={ref} changeValue={handleLimitPriceChange} />
                                        </Box>
                                        <Box sx={{display: 'flex', flexDirection: 'column', rowGap:'0.5rem' }}>
                                            <Typography>Shares</Typography>
                                            <QuantityInput changeValue={handleSharesChange} />
                                        </Box>
                                        {accessToken != undefined && accessToken != '' ? (
                                            <Button sx={{ backgroundColor: '#ee001299', color: 'white', ":hover": {
                                              backgroundColor: '#ee0012bb'
                                            }}} onClick={handleBuySellClick}>{buyOrSell == BUY ? 'Buy' : 'Sell'}</Button>
                                        ) : (
                                            <Login handleLoggedIn={handleLoggedIn} />
                                        )}

                                        <Box sx={{display: 'flex', rowGap: '0.25rem', flexDirection: 'column'}}>
                                            <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                <Typography>Total</Typography>
                                                <Typography>${ roundToTwo(shares * limitPrice / 100) }</Typography>
                                            </Box>

                                            { buyOrSell == BUY && (                                                
                                                <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                    <Typography>Potential Return</Typography>
                                                    {
                                                        limitPrice == 0 ? (
                                                            <Typography>$0.00(0.00%)</Typography>        
                                                        ) : (
                                                            <Typography>${roundToTwo(shares)}({ roundToTwo((shares/limitPrice) * 100) }%)</Typography>
                                                        )
                                                    }
                                                    
                                                </Box>
                                            )}
                                        </Box>
                                    </>
                                )}
                                
                            </Box>
                        </>
                    ) : (
                        <Box sx={styles.checkCircleIconBox}>
                            <CheckCircleIcon/>
                            <Typography>Outcome: {selectedBettingOption.result == 1 ? "Yes" : "No" }</Typography>
                        </Box>
                    )
                ) : (
                    <>
                        Please wait...
                    </>
                )}
            </Box>            
        </Box>
    )
}