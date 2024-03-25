import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Header from "./component/header/Index"
import Home from "./page/Home"
import Money from "./page/Money/Money"
import ProtectedRoute from "./feature/protectedRoute";
import AdminRoute from "./feature/adminRoute";
import { ToastContainer } from 'react-toastify';
import { useWatchContractEvent } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';
import CoastToken from "../../backend/src/artifacts/contracts/sepolia/CST.json";
import { useLocalStorage } from 'usehooks-ts';
import { useEffect } from 'react';
import { JwtDecoded } from './types';
import { jwtDecode } from 'jwt-decode';
import { formatUnits } from 'ethers';
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from './feature/slices/userSlice';
import { RootState } from './app/store';
import Dashboard from './page/Dashboard/Dashboard';
import EventCreatePage from './page/EventPage/EventCreatePage';
import EventEditPage from './page/EventPage/EventEditPage';
import EventReportPage from './page/EventPage/EventReportPage';
import Markets from './page/Market/Market';
import EventView from './page/EventPage/EventViewPage';
import socket from "./app/socket";
import { createOrder, removeOrder, updateOrder } from './feature/slices/orderSlice';

function App() {
  const dispatch = useDispatch();
  const [accessToken] = useLocalStorage<string>('accessToken', '')
  const [_, setCurrentMoney] = useLocalStorage<number>('currentMoney', 0)
  let previousToken = '';

  const { correspondingAddress } = useSelector((state: RootState) => state.userKey);
  const { selectedBettingOption } = useSelector((state: RootState) => state.eventKey);

  const fetchBalance = (address: string) => {
    if (address && address != '') {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/balance/${address}`)
			.then((response) => response.json())
			.then(({balance, decimals}) => {
				setCurrentMoney(Number(formatUnits(balance, Number(decimals))));
			})
			.catch((err) => {
				console.log(err);
			});
    } else {
      setCurrentMoney(0);
    }
  }

  useEffect(() => {
    if (accessToken == undefined || accessToken == '') {
      dispatch(setUserInfo({id: '', publicAddress: '', correspondingAddress: '', isAdmin: false}));
    }
    else if (accessToken != '' && accessToken != previousToken) {
      previousToken = accessToken;
      const {
				payload: {
					id,
          publicAddress,
					correspondingAddress,
          isAdmin
				}
			} = jwtDecode<JwtDecoded>(accessToken)
      dispatch(setUserInfo({id, publicAddress, correspondingAddress, isAdmin}));
    }
  }, [accessToken])

  const onOrderCreated = (data: any) => {
    debugger
    if (data.tokenId == selectedBettingOption?.yesTokenId || data.tokenId == selectedBettingOption?.noTokenId)
      createOrder(data);
    console.log(`Order Created....`)
  }

  const onOrderUpdated = (data: any) => {
    if (data.tokenId == selectedBettingOption?.yesTokenId || data.tokenId == selectedBettingOption?.noTokenId)
      updateOrder(data);
    console.log(`Order Updated....`)
  }

  const onOrderRemoved = (data: any) => {
    if (data.tokenId == selectedBettingOption?.yesTokenId || data.tokenId == selectedBettingOption?.noTokenId)
      removeOrder(data);
    console.log(`Order Deleted....`)
  }

  useEffect(() => {
    if (socket) {
        socket.on('Order created', onOrderCreated);
        socket.on('Order updated', onOrderUpdated);
        socket.on('Order deleted', onOrderRemoved);
    }
    return () => {
        socket.off('Order created', onOrderCreated);
        socket.off('Order updated', onOrderUpdated);
        socket.off('Order deleted', onOrderRemoved);
    }
}, [socket]);

  useEffect(() => {
		fetchBalance(correspondingAddress)
	}, [correspondingAddress])
  
  useWatchContractEvent({
    address: CoastToken.address as `0x${string}`,
    abi: CoastToken.abi,
    eventName: 'Transfer',
    onLogs(logs) {
      try {
        const { from, to } = (logs[0] as any).args;
        if(from.toLowerCase() == correspondingAddress.toLowerCase() || to.toLowerCase() == correspondingAddress.toLowerCase()) {
          fetchBalance(correspondingAddress)
        }
      } catch (err) {
        console.log(err);
      }
      
    },
  })
  // here in App, will show Header, and Routes.
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="money" element={<ProtectedRoute><Money /></ProtectedRoute>} />
        <Route path="markets" element={<Markets />} />
        <Route path="event/:ipfsUrl" element={<EventView />} />
        <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="dashboard/create" element={<AdminRoute><EventCreatePage /></AdminRoute>} />
        <Route path="dashboard/update/:eventID" element={<AdminRoute><EventEditPage /></AdminRoute>} />
        <Route path="dashboard/report/:ipfsUrl" element={<AdminRoute><EventReportPage /></AdminRoute>} />
      </Routes>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  )

  // return (
  //   <>
  //     <div>
  //       <h2>Account</h2>

  //       <div>
  //         status: {account.status}
  //         <br />
  //         addresses: {JSON.stringify(account.addresses)}
  //         <br />
  //         chainId: {account.chainId}
  //       </div>

  //       {account.status === 'connected' && (
  //         <button type="button" onClick={() => disconnect()}>
  //           Disconnect
  //         </button>
  //       )}
  //     </div>

  //     <div>
  //       <h2>Connect</h2>
  //       {connectors.map((connector) => (
  //         <button
  //           key={connector.uid}
  //           onClick={() => connect({ connector })}
  //           type="button"
  //         >
  //           {connector.name}
  //         </button>
  //       ))}
  //       <div>{status}</div>
  //       <div>{error?.message}</div>
  //     </div>
  //   </>
  // )
}

export default App
