import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { DialogContent, DialogContentText, DialogActions, Dialog, Button } from '@mui/material';
import { deleteAllOrdersFor, deleteOrder} from '../Slices/orderSlice';
/*
	orderbook must show the current event's orders.
	when user click buy, need to make order.
*/

export default function MyOrders() {
    const dispatch = useDispatch();
    const { orders } = useSelector((state) => state.orderKey);
    const { correspondingAddress } = useSelector((state: RootState) => state.userKey);
    const { selectedEvent, selectedBettingOption } = useSelector((state) => state.eventKey);

    const [myOrders, setMyOrders] = useState([]);
    const [openCancelAll, setOpenCancelAll] = useState(false);

    const openCancelAllDialog = () => {
      setOpenCancelAll(true);
    }
    const confirmCancelAll = () => {
      setOpenCancelAll(false);
      dispatch(deleteAllOrdersFor({
        correspondingAddress, 
        bettingOptionIndex: selectedBettingOption._id
      }));
    }

    const handleClose = () => {
      setOpenCancelAll(false);
    }

    const cancelOrder = (_id) => {
      dispatch(deleteOrder({_id}));
    }

    useEffect(() => {
        if (orders && correspondingAddress) {
            setMyOrders(
                orders.filter(order => order.wallet == correspondingAddress)
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
                    <td>{order.realYesOrNo == order.buyOrSell ? 'Buy' : 'Sell'}</td>
                    <td>{order.realYesOrNo ? 'Yes' : 'No'}</td>
                    <td>{order.realYesOrNo? order.price : 100 - order.price}c</td>
                    <td>{order.total - order.shares}/{order.total}</td>
                    <td>${(order.realYesOrNo? order.price : 100 - order.price) * order.shares/100}</td>
                    <td onClick={() => cancelOrder(order._id)}>X</td>
                </tr>
            ))}
          </tbody>
        </table>
        {open && (
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
        )}
      </>
      
    ) : null;
}