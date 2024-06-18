import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Typography } from '@mui/material';
import { NO, SELL, YES, roundToTwo } from '../../app/constant';
import { BigNumberish, formatUnits } from 'ethers';
import { setBuyOrSell, setShowNo } from '../../feature/slices/orderSlice';
import { PositionInfo } from '../../types';
import { RootState } from '../../app/store';
import { useLocalStorage } from 'usehooks-ts';
/*
	orderbook must show the current event's orders.
	when user click buy, need to make order.
*/

export default function Positions() {
    const { bettingOptionLogs } = useSelector((state: RootState) => state.orderKey);
    const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey);
    const { correspondingAddress } = useSelector((state: RootState) => state.userKey);
    const [accessToken] = useLocalStorage<string>('accessToken', '')

    const [positions, setPositions] = useState<PositionInfo[]>([]);
    const dispatch = useDispatch();

    const getBalanceOfConditionalTokenId = (tokenId: string) => {
        return fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getConditionalTokenBalanceFrom`, {
            body: JSON.stringify({
                tokenId
            }),
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            method: 'POST'
        })
        .then((response) => response.json())
        .then(({balance}) => ({
            balance
        }))
    }

    useEffect(() => {
        if (bettingOptionLogs.length > 0 && correspondingAddress != '' && correspondingAddress != '0x0000000000000000000000000000000000000000' && selectedBettingOption?.yesTokenId && selectedBettingOption?.noTokenId) {
            const getTokenPriceFromLastTransaction = (tokenId: string) => {
                for (let i = bettingOptionLogs.length - 1; i >= 0; i--) {
                    let log = bettingOptionLogs[i];
                    if (log.makerAssetId == tokenId) {
                        return Number(log.takerAmountFilled) * 100 / Number(log.makerAmountFilled);
                    } else if (log.takerAssetId == tokenId) {
                        return Number(log.makerAmountFilled) * 100/ Number(log.takerAmountFilled);
                    }
                }
                return 0;
            }

            let positions = [
                {
                    shares: 0,
                    currentPrice: 0
                }, 
                {
                    shares: 0,
                    currentPrice: 0
                }
            ];
            positions[Number(YES)].currentPrice = getTokenPriceFromLastTransaction(selectedBettingOption.yesTokenId);
            positions[Number(NO)].currentPrice = getTokenPriceFromLastTransaction(selectedBettingOption.noTokenId);

            let promises = [getBalanceOfConditionalTokenId(selectedBettingOption.yesTokenId), getBalanceOfConditionalTokenId(selectedBettingOption.noTokenId)];

            Promise.all(promises)
            .then((result) => {
                positions[Number(YES)].shares = Number(result[0].balance)
                positions[Number(NO)].shares = Number(result[1].balance)
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setPositions(positions)
            })
        } else {
            setPositions([]);
        }
    }, [bettingOptionLogs, selectedBettingOption, correspondingAddress]);
    
    return positions.length > 0 ? (
      <>
        <h1>Positions</h1>
        <table width="100%" style={{textAlign:"right"}}>
          <thead>
              <tr>
                  <th>Outcome</th>
                  <th>Shares</th>
                  <th>Value</th>
                  <th></th>
              </tr>
          </thead>
          <tbody>
            {positions.map((position: PositionInfo, index: number) => {
                return position.shares > 0 ? (
                    <tr key={index}>
                    <td>{index == Number(YES) ? 'Yes' : 'No'}</td>
                    <td>{roundToTwo(Number(formatUnits(`${position.shares}`, 6)))}</td>
                    <td>${roundToTwo(Number(formatUnits(`${position.shares}`, 6)) * position.currentPrice/100)}</td>
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