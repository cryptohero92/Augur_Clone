import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { BUY, SELL, mergeElements } from '../../app/constant';
import { setShowNo } from '../../feature/slices/orderSlice';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { RootState } from '../../app/store';
/*
	orderbook must show the current event's orders.
	when user click buy, need to make order.
*/
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function OrderBook() {
  const dispatch = useDispatch();
  const { orders, showNo } = useSelector((state: RootState) => state.orderKey);
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [spread, setSpread] = useState(0); 

  useEffect(() => {
    console.log(`orders redrawing`)
    if (!orders || !orders.length) {
      setBuyOrders([]);
      setSellOrders([]);
      return;
    }
    let _orders = orders.map(order => {
      const {price, buyOrSell, yesOrNo, ...rest} = order;
      if (yesOrNo == showNo) return {
        price: 100 - price,
        buyOrSell: !buyOrSell,
        yesOrNo: !yesOrNo,
        ...rest
      }
      else return {
        price,
        buyOrSell,
        yesOrNo,
        ...rest
      }
    });
    
    const buyOrders = mergeElements(_orders.filter(order => order.buyOrSell == BUY).sort((a, b) => b.price - a.price));
    setBuyOrders(buyOrders);
    const sellOrders = mergeElements(_orders.filter(order => order.buyOrSell == SELL).sort((a, b) => a.price - b.price)).reverse();
    setSellOrders(sellOrders);
    if (sellOrders.length > 0 && buyOrders.length > 0) {
      const spread = sellOrders.at(-1).price - buyOrders[0].price;
      setSpread(spread);
    }
  }, [orders, showNo]);

  const handleChange = (event, newValue) => {
    dispatch(setShowNo(!!newValue));
  };

  return (
    <Box sx={{ width: '100%'}}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={(+showNo)} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Trade Yes" {...a11yProps(0)} />
          <Tab label="Trade No" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <Box sx={{ height: '200px', overflowY: 'scroll' }}>
        <CustomTabPanel value={(+showNo)} index={0}>
          <Box sx={{ backgroundColor: '#eb5757'}}>
            <table width="100%" style={{textAlign: 'center'}}>
              <thead>
                <tr>
                  <th>price</th>
                  <th>Share</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sellOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.price}c</td>
                    <td>{order.shares}</td>
                    <td>${order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          
          <hr/>
          <div >
            <div>Spread: {spread}c</div>
          </div>
          <hr/>
          <Box sx={{backgroundColor: '#27ae60'}}>
            <table width="100%" style={{textAlign: 'center'}}>
              <thead>
                <tr>
                  <th>price</th>
                  <th>Share</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {buyOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.price}c</td>
                    <td>{order.shares}</td>
                    <td>${order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={(+showNo)} index={1}>
        <Box sx={{ backgroundColor: '#eb5757'}}>
            <table width="100%" style={{textAlign: 'center'}}>
              <thead>
                <tr>
                  <th>price</th>
                  <th>Share</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sellOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.price}c</td>
                    <td>{order.shares}</td>
                    <td>${order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
          
          <hr/>
          <div >
            <div>Spread: {spread}c</div>
          </div>
          <hr/>
          <Box sx={{backgroundColor: '#27ae60'}}>
            <table width="100%" style={{textAlign: 'center'}}>
              <thead>
                <tr>
                  <th>price</th>
                  <th>Share</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {buyOrders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.price}c</td>
                    <td>{order.shares}</td>
                    <td>${order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </CustomTabPanel>
      </Box>
    </Box>
  );
}