import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '../../app/store';
import { Box } from '@mui/material';

export default function BettingOptionButtons({ipfsUrl}: {ipfsUrl: string}) {
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
                        let price = side == 0 ? makerAmount * 100 / takerAmount: takerAmount * 100 / makerAmount;

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
            <Box sx={{ width: '150px', height: '48px', display:'flex', placeContent: 'center', alignItems: 'center', backgroundColor: '#eb57571a', color: 'red'}}>Buy No {noValue}¢</Box>
        </>
    )
}