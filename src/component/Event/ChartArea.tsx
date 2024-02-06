import { useEffect, useRef  } from "react";
import { useSelector, useDispatch } from "react-redux";

import { createChart, ColorType } from 'lightweight-charts';
import { Box } from "@mui/material";
import { fetchTransactions } from '../Slices/eventSlice';

export default function ChartArea({eventIndex, bettingOptionIndex}) {
    const chartContainerRef = useRef();

    const dispatch = useDispatch();
    const { selectedBettingOption, transactions } = useSelector((state) => state.eventKey);

    function fillArrayWithInterval(transactions, intervalInSeconds) {
        if (!selectedEvent) return [];
        const startTime = Date.parse(selectedEvent.createdAt);
        const endTime = Date.parse(new Date().toString());
    
        const newData = [];
        const intervalInMilliseconds = intervalInSeconds * 1000;
        let currentTime = startTime;
        let price = 50;
      
        while (currentTime < endTime) {
            let intimeTranactions = transactions.filter(transaction => {
                const transactionTime = Date.parse(transaction.date);
                return transactionTime >= currentTime && transactionTime < currentTime + intervalInMilliseconds
            });
            if (!intimeTranactions.length) {
                newData.push({ time: currentTime / 1000, value: price });
            } else {
                price = intimeTranactions.reduce((total, transaction) => total + transaction.price, 0) / intimeTranactions.length;  
                newData.push({ time: currentTime / 1000, value: price});
            }
            currentTime += intervalInMilliseconds;
        }  
        return newData;
    }

    const dataProduce = (transactions) => {
        // let yes_data = transactions.map(transaction => ({
        //     time: Date.parse(transaction.date)/1000,
        //     value: transaction.price
        // }));

        // let no_data = transactions.map(transaction => ({
        //     time: Date.parse(transaction.date)/1000,
        //     value: 100 - transaction.price
        // }));

        // return {yes_data, no_data};

        return fillArrayWithInterval(transactions, 30);
    }

    useEffect(() => {
        if (dispatch && selectedBettingOption) {
            dispatch(fetchTransactions({
                bettingOptionIndex: selectedBettingOption._id
            }));
        }
        
    }, [dispatch, selectedBettingOption ]);

    useEffect(() => {
        if (!transactions)
            return;
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'white' },
                textColor:'black',
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            }
        });

        chart.timeScale().fitContent();

        const newSeries = chart.addLineSeries({ 
            color: '#2962FF',
            lineWidth: 2,
            // disabling built-in price lines
            lastValueVisible: false,
            priceLineVisible: false,
        });

        const newSeries2 = chart.addLineSeries({ 
            color: '#ff2345',
            lineWidth: 2,
            // disabling built-in price lines
            lastValueVisible: false,
            priceLineVisible: false,
        });

        let yes_data = dataProduce(transactions);
        newSeries.setData(yes_data);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);

            chart.remove();
        };
    }, [transactions]);

    return (
        <Box ref={chartContainerRef} />
    )
}