import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Box, Typography, Button, IconButton, Divider, Grid, CircularProgress } from "@mui/material"
import QuantityInput from "./QuantityInput"
import BettingStyleSelectMenu from "./BettingStyleSelectMenu";
import CTFExchangeContract from "../../../../backend/src/artifacts/contracts/sepolia/CTFExchangeContract.json"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BettingStyle } from "../../types";
import { fetchOrders, setShowNo } from "../../feature/slices/orderSlice";
import { BUY, SELL, mergeElements, roundToTwo } from "../../app/constant";
import { BigNumberish, formatUnits, parseUnits } from 'ethers'
import { useLocalStorage } from "usehooks-ts";
import { RootState } from "../../app/store";
import { Auth } from "../../types";
import { Login } from "../header/Login/Login";
import axios from "axios";
import CachedIcon from '@mui/icons-material/Cached';

import { useSignTypedData, useAccount } from 'wagmi'
import { switchChain } from '@wagmi/core'
import { sepolia } from '@wagmi/core/chains'
import { config } from "../../wagmi";

export default function RightPanel() {

    const { signTypedDataAsync } = useSignTypedData()
    const { address: signerAddress } = useAccount()

    const dispatch = useDispatch();
    const ref = useRef();

    const [currentMoney, setCurrentMoney] = useLocalStorage<number>('currentMoney', 0)

    const { orders, showNo } = useSelector((state: RootState) => state.orderKey);
    const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey);
    const { correspondingAddress, publicAddress } = useSelector((state: RootState) => state.userKey);

    const [bettingStyle, setBettingStyle] = useState(BettingStyle.Limit);
    const [buyOrSell, setBuyOrSell] = useState(BUY);
    const [yesValue, setYesValue] = useState(50);
    const [noValue, setNoValue] = useState(50);
    const [yesShares, setYesShares] = useState(0);
    const [noShares, setNoShares] = useState(0);
    const [chainId, setChainId] = useState<number>(sepolia.id)
    const [insufficientBalance, setInsufficientBalance] = useState(false)

    const [avgValue, setAvgValue] = useState(50);
    const [predictedShares, setPredictedShares] = useState(0);
    const [amount, setAmount] = useState('0');
    const [estimatedAmountReceived, setEstimatedAmountReceived] = useState(0);
    const [limitPrice, setLimitPrice] = useState('0');
    const [shares, setShares] = useState('0');
    const [accessToken, setAccessToken] = useLocalStorage<string>('accessToken', '')
    const [isProgressing, setIsProgressing] = useState(false);

    // first, get yes and no token id based on bettingOption.
    // from bettionOption's ipfsUrl, can get bettingOption's yes and no token ids.
    // after getting yes and no token ids, on stakingcontract, by calling tokens[wallet]

    useEffect(() => {
        async function getResult() {
            if (selectedBettingOption && accessToken != '') {
                // once bettingOption selected, then need to calculate tokenId for yes and no tokens.
                fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getConditionalTokenBalanceOf`, {
                    body: JSON.stringify({
                        ipfsUrl: selectedBettingOption.ipfsUrl,
                        isYes: true
                    }),
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    method: 'POST'
                })
                .then((response) => response.json())
                .then(({balance}) => {
                    setYesShares(Number(formatUnits(balance as BigNumberish, 6)));
                })
                .catch(err => {
                    console.error(err);
                    setYesShares(0);
                });

                fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getConditionalTokenBalanceOf`, {
                    body: JSON.stringify({
                        ipfsUrl: selectedBettingOption.ipfsUrl,
                        isYes: false
                    }),
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    method: 'POST'
                })
                .then((response) => response.json())
                .then(({balance}) => {
                    setNoShares(Number(formatUnits(balance as BigNumberish, 6)));
                })
                .catch(err => {
                    console.error(err);
                    setNoShares(0);
                });
            } else {
                setYesShares(0);
                setNoShares(0);
            }
        }
        getResult();
        
    }, [selectedBettingOption, accessToken]);

    useEffect(() => {
        if (bettingStyle == BettingStyle.Market && buyOrSell == BUY) {
            setInsufficientBalance(Number(amount) > currentMoney)
        } else if (bettingStyle == BettingStyle.Limit && buyOrSell == BUY) {
            setInsufficientBalance(Number(limitPrice)/100 * Number(shares) > currentMoney)
        }
        if (buyOrSell == SELL) {
            setInsufficientBalance(Number(shares) > (showNo ? noShares : yesShares))
        }
    }, [buyOrSell, bettingStyle, amount, currentMoney, limitPrice, shares, showNo, noShares, yesShares])
    
    const handleLoggedIn = (auth: Auth) => {
        console.log(auth)
        const { accessToken } = auth;
        setAccessToken(accessToken);
    };

    const switchToChain = async (chainId: any) => {
        try {
          await switchChain(config, { chainId })
          console.log('Switched to chain:', chainId);
        } catch (error) {
          console.error('Error switching chain:', error);
        }
    };

    useEffect(() => {
        const getChainId = async () => {
            await window.ethereum.request({ method: 'eth_chainId' })
            .then((chainId: number) => {
                console.log("Connected chain ID:", chainId);
                setChainId(chainId);
            })
            .catch((error: any) => console.error(error));
        };
        
        getChainId();
    }, [])

    window.ethereum.on('chainChanged', (chainId: number) => {
        console.log("Chain switched to:", chainId);
        setChainId(chainId);
    });

    const claimCollateralForSelectedBettingOption = () => {
        if (selectedBettingOption) {
            setIsProgressing(true);
            fetch(`${import.meta.env.VITE_BACKEND_URL}/events/claim`, {
                body: JSON.stringify({
                  ipfsUrl: selectedBettingOption.ipfsUrl
                }),
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                method: 'POST'
              })
              .then((response) => {
                  if (response.status != 200) {
                      throw new Error('Error happened')
                  } else {
                      return response.json()
                  }
              })
              // If yes, retrieve it. If no, create it.
              .then((response) => response.json())
              .then(({hash}) => {
                console.log(`hash is ${hash}`)
                setIsProgressing(false);
              })
              .catch(err => {
                debugger
                console.error(err);
                setIsProgressing(false);
              });
        }
    }

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
        if (selectedBettingOption)
            dispatch(fetchOrders({ bettingOptionUrl: selectedBettingOption.ipfsUrl }) as any);
        fetchBalance(correspondingAddress);
    }

    const generateRandomSalt = () => {
        // Create a typed array to store the salt (4 bytes for int64)
        const saltArray = new Uint32Array(1);
    
        // Fill the typed array with random values
        crypto.getRandomValues(saltArray);
    
        // Combine the two 32-bit integers into a single int64 value
        return saltArray[0];
    }

    const handleBuySellClick = async () => {

        let collateralAmount, conditionalTokenAmount; 

        let _yesOrders = orders.map(order => {
            const { tokenId, makerAmount, takerAmount, side } = order;
            let price = side == 0 ? makerAmount * 100 / takerAmount: takerAmount * 100 / makerAmount;
            
            if (tokenId == selectedBettingOption?.yesTokenId) return {
                price,
                isBuy: side == 0 ? true: false,
                ...order
            }
            else return {
                price: 100 - price,
                isBuy: side == 1 ? true : false,
                ...order
            }
        });

        let _orders = _yesOrders;
        if (showNo) {
            _orders = _orders.map(order => {
                const { price, isBuy, ...rest} = order;
                return {
                price: 100 - price,
                isBuy: !isBuy,
                ...rest
                }
            })
        }

        let makerOrders = [];
        let takerFillAmount = 0;
        let makerFillAmounts = [];
        
        if (bettingStyle == BettingStyle.Market) {
            if (buyOrSell == BUY) {
                collateralAmount = Number(amount);
                conditionalTokenAmount = predictedShares;
                // need to calculate takerFillAmount and makerFillAmounts, and pick makerOrders.
                // first step is to sort orders 
                let remain = Number(amount) * 1000000;

                const sortedOrders = _orders.filter(order => order.isBuy == false).sort((a, b) => a.price - b.price);
                if (sortedOrders.length > 0) {
                    for (let i = 0; i < sortedOrders.length; i++) {
                        let order = sortedOrders[i];
                        if (remain >= order.price * order.shares / 100) {
                            makerOrders.push(order);

                            if (order.side == 0) {
                                makerFillAmounts.push(Math.floor((100 - order.price) * order.shares / 100));
                            } else { // this means sell token, so token count needed
                                makerFillAmounts.push(Math.floor(order.shares));
                            }
                            remain -= order.price * order.shares / 100;
                        } else {
                            makerOrders.push(order);

                            if (order.side == 0) {
                                makerFillAmounts.push(Math.floor((100 - order.price) * remain / order.price));
                            } else {
                                makerFillAmounts.push(Math.floor(remain * 100 / order.price));
                            }
                            remain = 0;
                            break;
                        }
                    }
                    takerFillAmount = Math.floor(Number(amount) * 1000000 - remain);
                }

            } else { // Sell Token
                collateralAmount = estimatedAmountReceived;
                conditionalTokenAmount = Number(shares);

                let remainingShares = Number(shares) * 1000000;
                const sortedOrders = _orders.filter(order => order.isBuy == true).sort((a, b) => a.price - b.price);

                if (sortedOrders.length > 0) {
                    for (let i = 0; i < sortedOrders.length; i++) {
                        let order = sortedOrders[i];
                        if (remainingShares >= order.shares) {
                            makerOrders.push(order);

                            if (order.side == 0) { // if buy order, then put collateral amount
                                makerFillAmounts.push(Math.floor(order.price * order.shares));
                            } else { // if sell order, then put complement 
                                makerFillAmounts.push(Math.floor(order.shares));
                            }
                            remainingShares -= order.shares;
                        } else {
                            makerOrders.push(order);
                            if (order.side == 0) {
                                makerFillAmounts.push(Math.floor(order.price * remainingShares));
                            } else {
                                makerFillAmounts.push(Math.floor(remainingShares));
                            }
                            remainingShares = 0;
                            break;
                        }
                    }
                    takerFillAmount = Math.floor(Number(shares) * 1000000 - remainingShares);
                }
            }
        } else { // limit
            collateralAmount = Number(shares) * Number(limitPrice) / 100;
            conditionalTokenAmount = Number(shares);
            let remainingShares = Number(shares) * 1000000;
            if (buyOrSell == BUY) {
                const sortedOrders = _orders.filter(order => order.isBuy == false).sort((a, b) => a.price - b.price);
                if (sortedOrders.length > 0) {
                    for (let i = 0; i < sortedOrders.length; i++) {
                        let order = sortedOrders[i];
                        if (order.price > Number(limitPrice)) break;
                        
                        if (remainingShares >= order.shares) {
                            makerOrders.push(order);

                            if (order.side == 0) { // buy complement, need to register collateral amount.    
                                makerFillAmounts.push(Math.floor((100 - order.price) * order.shares / 100));
                            } else { // sell token
                                makerFillAmounts.push(Math.floor(order.shares));
                            }
                            takerFillAmount += Math.floor(order.price * order.shares / 100);
                            remainingShares -= order.shares;
                        } else {
                            makerOrders.push(order);

                            if (order.side == 0) {
                                makerFillAmounts.push(Math.floor((100 - order.price) * remainingShares / 100));
                            } else {
                                makerFillAmounts.push(Math.floor(remainingShares));
                            }
                            takerFillAmount += Math.floor(order.price * remainingShares / 100);
                            remainingShares = 0;
                            break;
                        }
                        
                    }
                }
            } else { // sell token
                const sortedOrders = _orders.filter(order => order.isBuy == true).sort((a, b) => a.price - b.price);
                if (sortedOrders.length > 0) {
                    for (let i = 0; i < sortedOrders.length; i++) {
                        let order = sortedOrders[i];
                        if (order.price < Number(limitPrice)) break;

                        if (remainingShares > order.shares) {
                            makerOrders.push(order);

                            if (order.side == 0) { // buy token
                                makerFillAmounts.push(Math.floor(order.price * order.shares / 100));
                            } else { // sell complement
                                makerFillAmounts.push(Math.floor(order.shares));
                            }
                            remainingShares -= order.shares;
                        } else {
                            makerOrders.push(order);

                            if (order.side == 0) {
                                makerFillAmounts.push(Math.floor(order.price * remainingShares / 100));
                            } else {
                                makerFillAmounts.push(Math.floor(remainingShares));
                            }
                            remainingShares = 0;
                            break;
                        }
                    }
                    takerFillAmount = Math.floor(Number(shares) * 1000000 - remainingShares);
                }
            }
        }

        if (!selectedBettingOption)
            return;
        let takerOrder: any = {
            salt: `${generateRandomSalt()}`,
            maker: correspondingAddress as `0x${string}`,
            signer: signerAddress || publicAddress as `0x${string}`,
            taker: `0x0000000000000000000000000000000000000000`,
            tokenId: ((showNo ? selectedBettingOption.noTokenId : selectedBettingOption.yesTokenId) || '').toString(),
            makerAmount: parseUnits(`${buyOrSell == BUY ? Math.ceil(collateralAmount * 1000000) / 1000000 : Math.ceil(conditionalTokenAmount * 1000000) / 1000000}`, 6).toString(),
            takerAmount: parseUnits(`${buyOrSell == BUY ?  Math.floor(conditionalTokenAmount * 1000000) / 1000000 : Math.floor(collateralAmount * 1000000) / 1000000}`, 6).toString(),
            expiration: '0',
            nonce: '0',
            feeRateBps: '0',
            side: `${Number(!buyOrSell)}`,
            signatureType: '0'
        };

        const domainType = [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
        ];
        const orderType = [
            {name: 'salt', type: 'uint256'},
            {name: 'maker', type: 'address'},
            {name: 'signer', type: 'address'},
            {name: 'taker', type: 'address'},
            {name: 'tokenId', type: 'uint256'},
            {name: 'makerAmount', type: 'uint256'},
            {name: 'takerAmount', type: 'uint256'},
            {name: 'expiration', type: 'uint256'},
            {name: 'nonce', type: 'uint256'},
            {name: 'feeRateBps', type: 'uint256'},
            {name: 'side', type: 'uint8'},
            {name: 'signatureType', type: 'uint8'}
        ];

        const domain: any = { 
            name: 'PLSpeak CTF Exchange', 
            version: '1',
            chainId: 11155111,
            verifyingContract: CTFExchangeContract.address
        }

        takerOrder.signature = await signTypedDataAsync({
            types: {
                EIP712Domain: domainType,
                Order: orderType
            },
            domain: domain,
            primaryType: 'Order',
            message: takerOrder
        });
        takerOrder.bettingStyle = bettingStyle;
        takerOrder.shares = takerOrder.side == 0 ? takerOrder.takerAmount : takerOrder.makerAmount;

        const headers = { Authorization: `Bearer ${accessToken}` };

        // show waiting...
        setIsProgressing(true);

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/orders/match`, {takerOrder, makerOrders, takerFillAmount, makerFillAmounts}, { headers });
        } catch (err) {
            console.error(err);
        }
        // hide waiting...
        setIsProgressing(false);
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

    const handleAmountChange = (value: string) => {
        setAmount(value);
    }

    const handleSharesChange = (value: string) => {
        setShares(value);
    }

    const handleLimitPriceChange  = (value: string) => {
        setLimitPrice(value);
    }

    useEffect(() => {
        // if (!orders || !orders.length) return;
        let _yesOrders = orders.map(order => {
            const { tokenId, makerAmount, takerAmount, status, side, bettingStyle, ...rest} = order;
            let price = side == 0 ? makerAmount * 100 / takerAmount: takerAmount * 100 / makerAmount;

            if (tokenId == selectedBettingOption?.yesTokenId) return {
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

        let _orders = _yesOrders;
        if (showNo) {
            _orders = _orders.map(order => {
                const { price, side, ...rest} = order;
                return {
                price: 100 - price,
                side: 1 - side,
                ...rest
                }
            })
        }

        const sellOrders = mergeElements(_orders.filter(order => order.side == 1).sort((a, b) => a.price - b.price));
        
        let predictedShares = 0;
        let remain = Number(amount) * 1000000;
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
                avgValue = Number(amount) * 1000000 / predictedShares;
            }
        } else {
            avgValue = 100;
            predictedShares = 0;
        }
        setPredictedShares(Number(formatUnits(Math.floor(predictedShares), 6)));
        setAvgValue(avgValue);
    }, [amount]);

    useEffect(() => {
        // if (!orders || !orders.length) return;
        let _yesOrders = orders.map(order => {
            const { tokenId, makerAmount, takerAmount, status, side, bettingStyle, ...rest} = order;
            let price = side == 0 ? makerAmount * 100 / takerAmount: takerAmount * 100 / makerAmount;

            if (tokenId == selectedBettingOption?.yesTokenId) return {
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

        let _orders = _yesOrders;
        if (showNo) {
            _orders = _orders.map(order => {
                const { price, side, ...rest} = order;
                return {
                price: 100 - price,
                side: 1 - side,
                ...rest
                }
            })
        }

        const buyOrders = mergeElements(_orders.filter(order => order.side == 0).sort((a, b) => b.price - a.price));
        let remainingShares = Number(shares) * 1000000;
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
                avgValue = amountReceived / Number(shares);
            }
        } else {
            avgValue = 0;
            amountReceived = 0;
        }
        
        setAvgValue(avgValue);
        setEstimatedAmountReceived(amountReceived / 1000000);
    }, [shares]);

    useEffect(() => {
        // if (bettingStyle == BettingStyle.Market) {
        //     if (buyOrSell == BUY) {
        //         setAmount(0);
        //     } else {
        //         setShares(0);
        //     }
        // }
    }, [buyOrSell]);

    useEffect(() => {
        if (!orders || !orders.length) {
            setYesValue(50);
            setNoValue(50);
            return;
        }

        let _yesOrders = orders.map(order => {
            const {tokenId, makerAmount, takerAmount, status, side, bettingStyle, ...rest} = order;
            let price = side == 0 ? makerAmount * 100 / takerAmount: takerAmount * 100 / makerAmount;

            if (tokenId == selectedBettingOption?.yesTokenId) return {
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
        else
            setNoValue(50);
        if (sellOrders.length > 0)
            setYesValue(sellOrders[0].price);
        else
            setYesValue(50);
        
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
        },
        claimBox: {
            padding: '1.5rem'
        },
        claimButton: {
            color: 'white',
            backgroundColor: 'blue',
            borderRadius: '5px',
            width: 1,
            marginTop: '1rem',
            '&:hover': {
                backgroundColor: '#6347d0'
            },
            '&.Mui-disabled': { // Add styles for the disabled state
                backgroundColor: 'darkgray', // Change the background color for disabled state
                cursor: 'not-allowed' // Change cursor style for disabled state
            }
        }
    };

    function renderLeftRightOneLine(leftText: string, rightText: string) {
        return (
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography variant="body1">{leftText}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body1">{rightText}</Typography>
            </Grid>
          </Grid>
        );
      }

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
                                        <Button sx={styles.yesButton} onClick={() => onYesButtonClicked()}>Yes {roundToTwo(yesValue)}¢</Button>
                                        <Button sx={styles.noButton} onClick={() => onNoButtonClicked()}>No {roundToTwo(noValue)}¢</Button>
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
                                                    <QuantityInput value={amount} setValue={handleAmountChange} />
                                                    { insufficientBalance && (<Typography sx={{color: 'red'}}>Insufficient balance</Typography>) }
                                                </>
                                            ) : (
                                                <>
                                                    <Typography>Shares</Typography>
                                                    <QuantityInput value={shares} setValue={handleSharesChange} />
                                                    { insufficientBalance && (<Typography sx={{color: 'red'}}>Insufficient balance</Typography>) }
                                                </>
                                            )}

                                        </Box>

                                        {accessToken != undefined && accessToken != '' ? (chainId == sepolia.id ? (
                                            <Button disabled={isProgressing || (buyOrSell == BUY && (Number(amount) > currentMoney)) || (buyOrSell == SELL && (Number(shares) > (showNo ? noShares : yesShares)))} sx={{ backgroundColor: '#ee001299', color: 'white', ":hover": {
                                              backgroundColor: '#ee0012bb'
                                            }}} onClick={handleBuySellClick}>{buyOrSell == BUY ? 'Buy' : 'Sell'}</Button>
                                        ) : (<Button onClick={() => switchToChain(sepolia.id)}>Switch Network</Button>)) : (
                                            <Login handleLoggedIn={handleLoggedIn} />
                                        )}
                                        {isProgressing && (
                                            <CircularProgress />
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
                                                        <Typography>${roundToTwo(Number(amount)/avgValue * 100)}({ roundToTwo((100/avgValue - 1) * 100) }%)</Typography>
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
                                            <QuantityInput ref={ref} value={limitPrice} step={1} setValue={handleLimitPriceChange} />
                                        </Box>
                                        <Box sx={{display: 'flex', flexDirection: 'column', rowGap:'0.5rem' }}>
                                            <Typography>Shares</Typography>
                                            <QuantityInput value={shares} setValue={handleSharesChange} />
                                            { insufficientBalance && (<Typography sx={{color: 'red'}}>Insufficient balance</Typography>) }
                                        </Box>

                                        {accessToken != undefined && accessToken != '' ? (chainId == sepolia.id ? (
                                            <Button disabled={isProgressing || (buyOrSell == BUY && (Number(amount) > currentMoney)) || (buyOrSell == SELL && (Number(shares) > (showNo ? noShares : yesShares)))} sx={{ backgroundColor: '#ee001299', color: 'white', ":hover": {
                                              backgroundColor: '#ee0012bb'
                                            }}} onClick={handleBuySellClick}>{buyOrSell == BUY ? 'Buy' : 'Sell'}</Button>
                                        ) : (<Button onClick={() => switchToChain(sepolia.id)}>Switch Network</Button>)) : (
                                            <Login handleLoggedIn={handleLoggedIn} />
                                        )}
                                        {isProgressing && (
                                            <CircularProgress />
                                        )}

                                        <Box sx={{display: 'flex', rowGap: '0.25rem', flexDirection: 'column'}}>
                                            <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                <Typography>Total</Typography>
                                                <Typography>${ roundToTwo(Number(shares) * Number(limitPrice) / 100) }</Typography>
                                            </Box>

                                            { buyOrSell == BUY && (                                                
                                                <Box sx={{display: 'flex', width: 1, justifyContent: 'space-between'}}>
                                                    <Typography>Potential Return</Typography>
                                                    {
                                                        Number(limitPrice) == 0 ? (
                                                            <Typography>$0.00(0.00%)</Typography>        
                                                        ) : (
                                                            <Typography>${roundToTwo(Number(shares))}({ roundToTwo((Number(shares)/Number(limitPrice)) * 100) }%)</Typography>
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
                        <Box>
                            <Box sx={styles.checkCircleIconBox}>
                                <CheckCircleIcon/>
                                <Typography>Outcome: {selectedBettingOption.result == 1 ? "Yes" : "No" }</Typography>
                            </Box>
                            {accessToken != undefined && accessToken != '' && (
                                <>
                                    <Divider />
                                    <Box sx={styles.claimBox}>
                                        <Box sx={{textAlign: 'center'}}>Your Earning</Box>
                                        <Box>
                                            {yesShares > 0 && (
                                                <>
                                                    <Box>{renderLeftRightOneLine("Position", `${yesShares} Yes`)}</Box>
                                                    <Box>{renderLeftRightOneLine("Value per Share", selectedBettingOption.result == 1 ? "$1.00" : "$0.00")}</Box>
                                                </>
                                            )}
                                            {noShares > 0 && (
                                                <>
                                                    <Box>{renderLeftRightOneLine("Position", `${noShares} No`)}</Box>
                                                    <Box>{renderLeftRightOneLine("Value per Share", selectedBettingOption.result == 2 ? "$1.00" : "$0.00")}</Box>
                                                </>
                                            )}
                                            <Box>{renderLeftRightOneLine("Total", `${yesShares * (selectedBettingOption.result == 1 ? 1 : 0) + noShares * (selectedBettingOption.result == 2 ? 1 : 0)}`)}</Box>
                                        </Box>
                                        
                                        <Box>
                                            <Button disabled={yesShares * (selectedBettingOption.result == 1 ? 1 : 0) + noShares * (selectedBettingOption.result == 2 ? 1 : 0) == 0 || isProgressing} sx={styles.claimButton} onClick={claimCollateralForSelectedBettingOption}>Claim Winning</Button>
                                            {isProgressing && (<CircularProgress />)}
                                        </Box>
                                    </Box>
                                </>
                            )}
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