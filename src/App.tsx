import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Header from "./component/header/Index"
import Home from "./page/Home"

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  // here in App, will show Header, and Routes.
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
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
