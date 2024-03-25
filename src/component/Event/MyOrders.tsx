import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { DialogContent, DialogContentText, DialogActions, Dialog, Button } from '@mui/material';
import { RootState } from '../../app/store';
import { useLocalStorage } from 'usehooks-ts';
import axios from 'axios';
import { OrderInfo } from '../../types';
import { roundToTwo } from '../../app/constant';
import { formatUnits } from 'ethers';
/*
	orderbook must show the current event's orders.
	when user click buy, need to make order.
*/

export default function MyOrders() {
    const { orders } = useSelector((state: RootState) => state.orderKey);
    const { correspondingAddress } = useSelector((state: RootState) => state.userKey);
    const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey)
    const [accessToken] = useLocalStorage<string>('accessToken', '')

    const [myOrders, setMyOrders] = useState<OrderInfo[]>([]);
    const [openCancelAll, setOpenCancelAll] = useState(false);

    const openCancelAllDialog = () => {
      setOpenCancelAll(true);
    }
    const confirmCancelAll = async () => {
      setOpenCancelAll(false);
      const headers = { Authorization: `Bearer ${accessToken}` };
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
          headers,
          data: { bettingOptionUrl: selectedBettingOption?.ipfsUrl }
      });
    }

    const handleClose = () => {
      setOpenCancelAll(false);
    }

    const cancelOrder = async (_id: any) => {
      const headers = { Authorization: `Bearer ${accessToken}` };
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/orders/${_id}`, {
          headers
      });
    }

    useEffect(() => {
        if (orders && correspondingAddress) {
            setMyOrders(
                orders.filter(order => order.maker == correspondingAddress)
            );
        }
    }, [orders, correspondingAddress]);
    return myOrders.length ? (
      <>
        <h1>Open Orders</h1>
        <table width="100%" style={{textAlign:"right"}}>
          <thead>
              <tr>
                  <th>Side</th>
                  <th>Outcome</th>
                  <th>Price</th>
                  <th>Filled</th>
                  <th>Total</th>
                  <th onClick={() => openCancelAllDialog()}>Cancel All</th>
              </tr>
          </thead>
          <tbody>
            {myOrders.map((order) => (
                <tr key={order._id}>
                    <td>{order.side == 0 ? 'Buy' : 'Sell'}</td>
                    <td>{order.tokenId == selectedBettingOption?.yesTokenId ? 'Yes' : 'No'}</td>
                    <td>{roundToTwo(order.side == 0 ? order.makerAmount * 100 / order.takerAmount : order.takerAmount * 100 / order.makerAmount)}c</td>
                    <td>{ roundToTwo(Number(formatUnits(Number(order.side == 0 ? order.takerAmount : order.makerAmount) - Number(order.shares), 6))) }/{roundToTwo(Number(formatUnits(order.side == 0 ? order.takerAmount : order.makerAmount, 6)))}</td>
                    <td>${roundToTwo(Number(formatUnits(order.side == 0 ? order.makerAmount : order.takerAmount, 6)))}</td>
                    <td onClick={() => cancelOrder(order._id)}>X</td>
                </tr>
            ))}
          </tbody>
        </table>
        <Dialog
            open={openCancelAll}
            onClose={handleClose}
            aria-labelledby="Cancel Orders"
        >
            <DialogContent style={{ width: 300 }}>
                <DialogContentText>Are you sure you want to cancel all open orders?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={handleClose} color="primary">
                Never mind
                </Button>
                <Button onClick={confirmCancelAll} color="primary" autoFocus>
                Confirm
                </Button>
            </DialogActions>
        </Dialog>
      </>
      
    ) : null;
}