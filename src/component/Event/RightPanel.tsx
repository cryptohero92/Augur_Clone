import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Box, Typography, Button, IconButton } from "@mui/material"
import QuantityInput from "./QuantityInput"
import BettingStyleSelectMenu from "./BettingStyleSelectMenu";
import { readContract } from "@wagmi/core";
import { config } from "../../wagmi";
import PLSpeakContract from '../../artifacts/contracts/sepolia/PLSpeakContract.json'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BettingStyle } from "../../types";
import { fetchOrders, setShowNo } from "../../feature/slices/orderSlice";
import { BUY, SELL, mergeElements, roundToTwo } from "../../app/constant";
import { BigNumberish, formatUnits } from 'ethers'
import { useLocalStorage } from "usehooks-ts";
import { RootState } from "../../app/store";
import { Auth } from "../../types";
import { Login } from "../header/Login/Login";
import axios from "axios";
import CachedIcon from '@mui/icons-material/Cached';

import { useSignTypedData, useAccount } from 'wagmi'

export default function RightPanel() {

    const { signTypedData } = useSignTypedData()
    const { address: signerAddress } = useAccount()

    const dispatch = useDispatch();
    const ref = useRef();

    const [currentMoney, setCurrentMoney] = useLocalStorage<number>('currentMoney', 0)

    const { orders, showNo } = useSelector((state: RootState) => state.orderKey);
    const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey);
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

    // first, get yes and no token id based on bettingOption.
    // from bettionOption's ipfsUrl, can get bettingOption's yes and no token ids.
    // after getting yes and no token ids, on stakingcontract, by calling tokens[wallet]

    useEffect(() => {
        async function getResult() {
            if (selectedBettingOption) {
                const yesTokenAmount = await readContract(config, {
                    abi: PLSpeakContract.abi,
                    address: PLSpeakContract.address as `0x${string}`,
                    functionName: 'getConditionalTokenBalanceOf',
                    args: [correspondingAddress, selectedBettingOption.ipfsUrl, true]
                });
                setYesShares(Number(formatUnits(yesTokenAmount as BigNumberish, 6)));

                const noTokenAmount = await readContract(config, {
                    abi: PLSpeakContract.abi,
                    address: PLSpeakContract.address as `0x${string}`,
                    functionName: 'getConditionalTokenBalanceOf',
                    args: [correspondingAddress, selectedBettingOption.ipfsUrl, false]
                });
                setNoShares(Number(formatUnits(noTokenAmount as BigNumberish, 6)));
            }
        }
        getResult();
        
    }, [selectedBettingOption, currentMoney]);

    const [accessToken, setAccessToken] = useLocalStorage<string>('accessToken', '')
    const handleLoggedIn = (auth: Auth) => {
        console.log(auth)
        const { accessToken } = auth;
        setAccessToken(accessToken);
    };

    const fetchBalance = (address: string) => {
        if (address && address != '') {
          fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/balance/${address}`)
                .then((response) => response.json())
                .then(({balance, decimals}) => {
                    setCurrentMoney(Number(formatUnits(balance, Number(decimals))));
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
          setCurrentMoney(0);
        }
      }

    const refreshOrders = async () => {
        dispatch(fetchOrders({ bettingOptionUrl: selectedBettingOption?.ipfsUrl }));
        fetchBalance(correspondingAddress);
    }

    const handleBuySellClick = async () => {

        signTypedData({
            types: {
                Order: [
                    {name: 'salt', type: 'string'},
                    {name: 'maker', type: 'address'},
                    {name: 'signer', type: 'address'},
                    {name: 'tokenId', type: 'string'},
                    {name: 'makerAmount', type: 'string'},
                    {name: 'takerAmount', type: 'string'},
                    {name: 'side', type: 'string'}
                ]
            },
            primaryType: 'Order',
            message: {
                salt: "1453748698939",
                maker: correspondingAddress as `0x${string}`,
                signer: signerAddress as `0x${string}`,
                tokenId: "77388186162523430247013885567410421379561978665212558917136992458560483660506",
                makerAmount: "1000000",
                takerAmount: "11111100",
                side: "0"
            }
        })

        // const headers = { Authorization: `Bearer ${accessToken}` };

        // await axios.post(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
        //     bettingOptionUrl: selectedBettingOption?.ipfsUrl,
        //     bettingStyle,
        //     buyOrSell,
        //     yesOrNo: !showNo,
        //     amount,
        //     limitPrice,
        //     shares
        // }, { headers });
        // dispatch(fetchOrders({ bettingOptionUrl: selectedBettingOption?.ipfsUrl }));
    }

    const onYesButtonClicked = () => {
        if (ref.current) {
            (ref.current as any).updateInputValue(yesValue);    
        }
        dispatch(setShowNo(false));
    }

    const onNoButtonClicked = () => {
        if (ref.current) {
            (ref.current as any).updateInputValue(noValue);    
        }
        dispatch(setShowNo(true));   
    }

    const handleAmountChange = (value: number) => {
        setAmount(Number(value));
    }

    const handleSharesChange = (value: number) => {
        setShares(Number(value));
    }

    const handleLimitPriceChange  = (value: number) => {
        setLimitPrice(Number(value));
    }

    useEffect(() => {
        if (!orders || !orders.length) return;
        let _orders = orders.map(order => {
          const {price, buyOrSell, yesOrNo, ...rest} = order;
          if (yesOrNo == showNo) return {
            price: 100 - price,
            buyOrSell: !buyOrSell,
            yesOrNo: !yesOrNo,
            ...rest
          }
          else return {
            price,
            buyOrSell,
            yesOrNo,
            ...rest
          }
        });

        const sellOrders = mergeElements(_orders.filter(order => order.buyOrSell == SELL).sort((a, b) => a.price - b.price));
        
        let predictedShares = 0;
        let remain = amount * 100;
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
                avgValue = amount * 100 / predictedShares;
            }
        }
        setPredictedShares(predictedShares);
        setAvgValue(avgValue);
    }, [amount]);

    useEffect(() => {
        if (!orders || !orders.length) return;
        let _orders = orders.map(order => {
          const {price, buyOrSell, yesOrNo, ...rest} = order;
          if (yesOrNo == showNo) return {
            price: 100 - price,
            buyOrSell: !buyOrSell,
            yesOrNo: !yesOrNo,
            ...rest
          }
          else return {
            price,
            buyOrSell,
            yesOrNo,
            ...rest
          }
        });

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

        // when order arrives, first get yes 
        let _yesOrders = orders.map(order => {
            const {price, buyOrSell, yesOrNo, ...rest} = order;
            if (yesOrNo == false) return {
                price: 100 - price,
                buyOrSell: !buyOrSell,
                yesOrNo: true,
                ...rest
            }
            else return {
                price,
                buyOrSell,
                yesOrNo,
                ...rest
            }
        });
        const sellOrders = mergeElements(_yesOrders.filter(order => order.buyOrSell == SELL).sort((a, b) => a.price - b.price));
        const buyOrders = mergeElements(_yesOrders.filter(order => order.buyOrSell == BUY).sort((a, b) => b.price - a.price));

        if (buyOrders.length > 0)
            setNoValue(100 - buyOrders[0].price);
        if (sellOrders.length > 0)
            setYesValue(sellOrders[0].price);
        
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
                                    <Box sx={{display: 'flex'}}>
                                        <Typography sx={{flex: 1}}>Outcome</Typography>
                                        <IconButton sx={{height: '15px', width: '15px'}} onClick={refreshOrders}>
                                            <CachedIcon />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{display: 'flex'}}>
                                        <Button sx={styles.yesButton} onClick={() => onYesButtonClicked()}>Yes {yesValue}¢</Button>
                                        <Button sx={styles.noButton} onClick={() => onNoButtonClicked()}>No {noValue}¢</Button>
                                    </Box>
                                    <Box sx={{display: 'flex'}}>
                                        <Box sx={{width: 1, color: 'green'}}>{roundToTwo(yesShares)} shares</Box>
                                        <Box sx={{width: 1, color: 'orange'}}>{roundToTwo(noShares)} shares</Box>
                                    </Box>
                                </Box>
                                {bettingStyle == BettingStyle.Market && (
                                    <>
                                        <Box sx={{display: 'flex', flexDirection: 'column' }}>
                                            {buyOrSell == BUY ? (
                                                <>
                                                    <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                                                        <Typography>Amount($)</Typography>
                                                        <Typography>Balance: ${roundToTwo(currentMoney)}</Typography>
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
                                                <Typography>{roundToTwo(avgValue)}¢</Typography>
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
                                                    <Typography>Balance: {roundToTwo(currentMoney)}</Typography>
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