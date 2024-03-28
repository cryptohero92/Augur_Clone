import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Button, Typography } from '@mui/material';
import { RootState } from '../../app/store';
import { useLocalStorage } from 'usehooks-ts';
import { NO, SELL, YES, roundToTwo } from '../../app/constant';
import { formatUnits } from 'ethers';
import { setBuyOrSell, setShowNo } from '../../feature/slices/orderSlice';
import { PositionInfo } from '../../types';
/*
	orderbook must show the current event's orders.
	when user click buy, need to make order.
*/

export default function Positions() {
    const { orders } = useSelector((state: RootState) => state.orderKey);
    const { correspondingAddress } = useSelector((state: RootState) => state.userKey);
    const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey)
    const [accessToken] = useLocalStorage<string>('accessToken', '')
    const [positions, setPositions] = useState<PositionInfo[]>([]);

    const dispatch = useDispatch();

    useEffect(() => {
        async function getResult() {
            if (selectedBettingOption && accessToken != '') {
                // once bettingOption selected, then need to calculate tokenId for yes and no tokens.
                let positions = [
                    {
                        shares: 0,
                        spentMoney:0,
                        currentPrice: 0
                    }, 
                    {
                        shares: 0,
                        spentMoney:0,
                        currentPrice: 0
                    }
                ];
                try {
                    let tokenIdPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getTokenIds/${selectedBettingOption.ipfsUrl}`)
                    .then((response) => response.json())
                    .then((res) => {
                        return res
                    });

                    let EventLogPromise = fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getEventLogsFor/${selectedBettingOption.ipfsUrl}/OrderFilled`)
                    .then((response) => response.json())
                    .then((res) => {
                        return { extractedLogs: res.extractedLogs};
                    });
                    Promise.all([tokenIdPromise, EventLogPromise]).then(results => (Object.assign({}, ...results))).then(({yesTokenId, noTokenId, extractedLogs}) => {
                        debugger
                        const getTokenPriceFromLastTransaction = (tokenId) => {
                            for (let i = extractedLogs.length - 1; i >= 0; i--) {
                                let log = extractedLogs[i];
                                if (log.makerAssetId == tokenId) {
                                    return Number(log.takerAmountFilled) * 100 / Number(log.makerAmountFilled);
                                } else if (log.takerAssetId == tokenId) {
                                    return Number(log.makerAmountFilled) * 100/ Number(log.takerAmountFilled);
                                }
                            }
                            return 0;
                        }

                        let logs = extractedLogs.filter(log => {
                            return log.maker == correspondingAddress || log.taker == correspondingAddress
                        });
                        positions[Number(YES)].currentPrice = getTokenPriceFromLastTransaction(yesTokenId);
                        positions[Number(NO)].currentPrice = getTokenPriceFromLastTransaction(noTokenId);

                        for (let i = 0; i < logs.length; i++) {
                            let log = logs[i];

                            let indexInPositions = log.makerAssetId == yesTokenId || log.takerAssetId == yesTokenId ? Number(YES) : Number(NO);

                            if (log.makerAssetId == '0') { // collateral pay
                                positions[indexInPositions].spentMoney += Number(log.makerAmountFilled);
                                positions[indexInPositions].shares += Number(log.takerAmountFilled);
                            } else if (log.takerAssetId == '0') {
                                positions[indexInPositions].spentMoney -= Number(log.takerAmountFilled);
                                positions[indexInPositions].shares -= Number(log.makerAmountFilled);
                            }
                        }
                        debugger
                        setPositions(positions)
                    })
                } catch (err) {
                    debugger
                    console.error(err);
                }
                
            }
        }
        getResult();
    }, [selectedBettingOption, accessToken, orders]);
    return positions.length ? (
      <>
        <h1>Positions</h1>
        <table width="100%" style={{textAlign:"right"}}>
          <thead>
              <tr>
                  <th>Outcome</th>
                  <th>Shares</th>
                  <th>AVG</th>
                  <th>Value</th>
                  <th>Total Return</th>
                  <th></th>
              </tr>
          </thead>
          <tbody>
            {positions.map((position: PositionInfo, index: number) => {
                return position.shares > 0 ? (
                    <tr key={index}>
                    <td>{index == Number(YES) ? 'Yes' : 'No'}</td>
                    <td>{roundToTwo(Number(formatUnits(`${position.shares}`, 6)))}</td>
                    <td>{ roundToTwo(position.spentMoney * 100 / position.shares)}c</td>
                    <td>${roundToTwo(Number(formatUnits(`${position.shares}`, 6)) * position.currentPrice/100)}</td>
                    <td><Box sx={{float: 'right', display: 'flex'}}>{position.shares * position.currentPrice / 100 - position.spentMoney < 0 && (<>-</>)}${roundToTwo(Number(formatUnits(Math.abs(position.shares * position.currentPrice / 100 - position.spentMoney), 6)))}<Typography sx={{color: position.shares * position.currentPrice / 100 - position.spentMoney < 0 ? 'red' : 'green'}}>({roundToTwo((position.shares * position.currentPrice / 100 - position.spentMoney) * 100 / (position.spentMoney))}%)</Typography></Box></td>
                    <td><Button onClick={() =>{ dispatch(setShowNo(index == Number(NO))); dispatch(setBuyOrSell(SELL))}}>Sell</Button></td>
                </tr>
                ) : (null)
            }
                
            )}
          </tbody>
        </table>
      </>      
    ) : null;
}