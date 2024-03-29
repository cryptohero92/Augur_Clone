import { useEffect, useRef, useState  } from "react";
import { createChart, ColorType, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { LogInfo } from "../../types";
import { roundToTwo } from "../../app/constant";

export default function ChartArea() {
    const chartContainerRef = useRef();
    const { bettingOptionLogs } = useSelector((state: RootState) => state.orderKey);
    const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey);
    const [yesSeries, setYesSeries] = useState<ISeriesApi<"Line", any>| null>(null)
    const [noSeries, setNoSeries] = useState<ISeriesApi<"Line", any>| null>(null)

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

        let _yesSeries = chart.addLineSeries({ 
            color: '#2962FF',
            lineWidth: 2,
            // disabling built-in price lines
            lastValueVisible: false,
            priceLineVisible: false,
        });

        let _noSeries = chart.addLineSeries({ 
            color: '#ff2345',
            lineWidth: 2,
            // disabling built-in price lines
            lastValueVisible: false,
            priceLineVisible: false,
        });

        // Generate data points for the past week at one-minute intervals
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

        const data = [];
        for (let timestamp = oneWeekAgo; timestamp <= now; timestamp += 60 * 1000) {
            const x = timestamp;
            const y = 50; // Generate random data for demonstration
            // data.push({ time: format(x, 'yyyy-MM-dd hh:mm'), value: y });
            data.push({ time: x as UTCTimestamp, value: y });
        }

        _yesSeries.setData(data);
        _noSeries.setData(data);
        setYesSeries(_yesSeries);
        setNoSeries(_noSeries);

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [])

    const getLatestPriceFrom = (logs: LogInfo[], timestampLimit: number, tokenId: string) => {
        let latestLog = logs.filter(log => log.timestamp <= timestampLimit && (log.makerAssetId == tokenId || log.takerAssetId == tokenId)).sort((a, b) => a.timestamp - b.timestamp).at(-1)
        if (latestLog) {
            return roundToTwo((latestLog.makerAssetId == tokenId ? Number(latestLog.takerAmountFilled) / Number(latestLog.makerAmountFilled) : Number(latestLog.makerAmountFilled) / Number(latestLog.takerAmountFilled)) * 100)
        } else {
            return 50;
        }
    }

    const updateSeriesData = (series: ISeriesApi<"Line", any>, tokenId: string) => {
        const now = Date.now();
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const data = [];
        for (let timestamp = oneWeekAgo; timestamp <= now; timestamp += 60 * 1000) {
            const x = timestamp;
            const y = getLatestPriceFrom(bettingOptionLogs, timestamp, tokenId);
            // data.push({ time: format(x, 'yyyy-MM-dd hh:mm'), value: y });
            data.push({ time: x as UTCTimestamp, value: y });
        }
        series.setData(data)
    }

    useEffect(() => {
        if (bettingOptionLogs.length == 0) return;
        
        if ( selectedBettingOption?.yesTokenId && yesSeries) {
            updateSeriesData(yesSeries, selectedBettingOption.yesTokenId);
        }
        if (selectedBettingOption?.noTokenId && noSeries) {
            updateSeriesData(noSeries, selectedBettingOption.noTokenId);
        }

        // newSeries?.setData([
        //     { time: '2019-04-11', value: 90.01 },
        //     { time: '2019-04-12', value: 96.63 },
        //     { time: '2019-04-13', value: 76.64 },
        //     { time: '2019-04-14', value: 81.89 },
        //     { time: '2019-04-15', value: 74.43 },
        //     { time: '2019-04-16', value: 80.01 },
        //     { time: '2019-04-17', value: 96.63 },
        //     { time: '2019-04-18', value: 76.64 },
        //     { time: '2019-04-19', value: 81.89 },
        //     { time: '2019-04-20', value: 74.43 },
        // ]);
    }, [bettingOptionLogs, yesSeries, noSeries, selectedBettingOption]);

    return (
        <Box ref={chartContainerRef} />
    )
}