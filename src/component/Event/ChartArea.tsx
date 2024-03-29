import { useEffect, useRef, useState  } from "react";
import { createChart, ColorType, ISeriesApi } from 'lightweight-charts';
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

export default function ChartArea() {
    const chartContainerRef = useRef();
    const { bettingOptionLogs } = useSelector((state: RootState) => state.orderKey);
    const [newSeries, setNewSeries] = useState<ISeriesApi<"Line", any>| null>(null)

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

        let _newSeries = chart.addLineSeries({ 
            color: '#2962FF',
            lineWidth: 2,
            // disabling built-in price lines
            lastValueVisible: false,
            priceLineVisible: false,
        });
        _newSeries.setData([
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
        setNewSeries(_newSeries);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);

            chart.remove();
        };
    }, [])

    useEffect(() => {
        if (bettingOptionLogs.length > 0) {

        }
        newSeries?.setData([
            { time: '2019-04-11', value: 90.01 },
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
    }, [bettingOptionLogs, newSeries]);

    return (
        <Box ref={chartContainerRef} />
    )
}