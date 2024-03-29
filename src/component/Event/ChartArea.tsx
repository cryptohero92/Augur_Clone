import { useEffect, useRef  } from "react";
// import { useSelector, useDispatch } from "react-redux";

import { createChart, ColorType } from 'lightweight-charts';
import { Box } from "@mui/material";
// import { RootState } from "../../app/store";

export default function ChartArea() {
    const chartContainerRef = useRef();

    // useEffect(() => {
    //     if (selectedBettingOption) {
    //         dispatch(fetchTransactions({
    //             eventIndex:selectedEvent._id, 
    //             bettingOptionIndex: selectedBettingOption._id
    //         }));
    //     }
        
    // }, [selectedBettingOption ]);

    useEffect(() => {
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

        newSeries.setData([
            { time: '2019-04-11', value: 80.01 },
            { time: '2019-04-12', value: 96.63 },
            { time: '2019-04-13', value: 76.64 },
            { time: '2019-04-14', value: 81.89 },
            { time: '2019-04-15', value: 74.43 },
            { time: '2019-04-16', value: 80.01 },
            { time: '2019-04-17', value: 96.63 },
            { time: '2019-04-18', value: 76.64 },
            { time: '2019-04-19', value: 81.89 },
            { time: '2019-04-20', value: 74.43 },
        ]);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);

            chart.remove();
        };
    }, []);

    return (
        <Box ref={chartContainerRef} />
    )
}