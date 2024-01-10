import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Header from "./component/header/Index"
import Home from "./page/Home"
import Money from "./page/Money/Money"
import ProtectedRoute from "./feature/protectedRoute";
import { ToastContainer } from 'react-toastify';
import { useWatchContractEvent } from 'wagmi';

import 'react-toastify/dist/ReactToastify.css';
import CoastToken from './artifacts/contracts/sepolia/CST.json'
import { useLocalStorage } from 'usehooks-ts';
import { useEffect } from 'react';
import { JwtDecoded } from './types';
import { jwtDecode } from 'jwt-decode';
import { formatUnits } from 'ethers';
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from './feature/slices/userSlice';
import { RootState } from './app/store';

function App() {
  const dispatch = useDispatch();
  const [accessToken] = useLocalStorage<string>('accessToken', '')
  const [_, setCurrentMoney] = useLocalStorage<number>('currentMoney', 0)
  let previousToken = '';

  const { correspondingAddress } = useSelector((state: RootState) => state.userKey);

  useEffect(() => {
    if (accessToken == '') {
      dispatch(setUserInfo({id: 0, correspondingAddress: ''}));
    }
    else if (accessToken != '' && accessToken != previousToken) {
      previousToken = accessToken;
      const {
				payload: {
					id,
					correspondingAddress
				}
			} = jwtDecode<JwtDecoded>(accessToken)
      dispatch(setUserInfo({id: Number(id), correspondingAddress}));
    }
  }, [accessToken])

  useEffect(() => {
		fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/balance/${correspondingAddress}`)
			.then((response) => response.json())
			.then(({balance, decimals}) => {
				setCurrentMoney(Number(formatUnits(balance, Number(decimals))));
			})
			.catch((err) => {
				console.log(err);
				setCurrentMoney(0);
			});
	}, [correspondingAddress])
  
  useWatchContractEvent({
    address: CoastToken.address as `0x${string}`,
    abi: CoastToken.abi,
    eventName: 'Transfer',
    onLogs(logs) {
      debugger
      try {
        const { from, to } = (logs[0] as any).args;
        if(from == correspondingAddress || to == correspondingAddress) {
          // re-get balance.
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
