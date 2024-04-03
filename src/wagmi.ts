import { http, createConfig } from 'wagmi'
import { pulsechainV4, pulsechain } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [pulsechain, pulsechainV4],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'Create Wagmi' }),
    walletConnect({ projectId: import.meta.env.VITE_WC_PROJECT_ID }),
  ],
  transports: {
    [pulsechain.id]: http(),
    [pulsechainV4.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}