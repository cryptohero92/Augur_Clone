import { Routes, Route, BrowserRouter } from 'react-router-dom'

import Header from "./component/header/Index"
import Home from "./page/Home"
import Money from "./page/Money/Money"
import ProtectedRoute from "./feature/protectedRoute";
import { ToastContainer } from 'react-toastify';

function App() {
  
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
