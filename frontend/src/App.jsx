import { useEffect, useMemo, useState } from 'react'
import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect'
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from './stacks'
import { ro } from './lib/stacksClient'
import { cvToJSON, principalCV, uintCV, noneCV } from '@stacks/transactions'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

export default function App() {
  const [address, setAddress] = useState('')
  const [connected, setConnected] = useState(false)

  const isMainnet = useMemo(() => NETWORK?.isMainnet?.() ?? false, [])

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData()
      const addr = userData.profile.stxAddress[isMainnet ? 'mainnet' : 'testnet']
      setAddress(addr)
      setConnected(true)
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(userData => {
        const addr = userData.profile.stxAddress[isMainnet ? 'mainnet' : 'testnet']
        setAddress(addr)
        setConnected(true)
      })
    }
  }, [isMainnet])

  const connect = () => {
    showConnect({
      appDetails: { name: 'PSHT Frontend', icon: window.location.origin + '/vite.svg' },
      userSession,
      onFinish: () => {
        const userData = userSession.loadUserData()
        const addr = userData.profile.stxAddress[isMainnet ? 'mainnet' : 'testnet']
        setAddress(addr)
        setConnected(true)
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="max-w-4xl mx-auto py-6 px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">PSHT Frontend</h1>
        {!connected ? (
          <button onClick={connect} className="px-4 py-2 rounded-lg bg-black text-white">Connect Leather</button>
        ) : (
          <div className="text-sm px-3 py-1 rounded bg-white shadow">{address.slice(0,6)}...{address.slice(-6)}</div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 grid gap-6">
        <TokenInfo />
        <Balance address={address} />
        <TransferForm address={address} />
        <AdminMint />
        <BurnForm address={address} />
      </main>
    </div>
  )
}

function TokenInfo() {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState('')
  const [supply, setSupply] = useState('')

  useEffect(() => {
    let mounted = true
    const run = async () => {
      const n = cvToJSON(await ro('get-name')).value
      const s = cvToJSON(await ro('get-symbol')).value
      const d = cvToJSON(await ro('get-decimals')).value
      const ts = cvToJSON(await ro('get-total-supply')).value
      if (!mounted) return
      setName(n); setSymbol(s); setDecimals(d); setSupply(ts)
    }
    run(); return () => { mounted = false }
  }, [])

  return (
    <section className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">Token Info</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Name</div><div className="font-mono">{name}</div>
        <div>Symbol</div><div className="font-mono">{symbol}</div>
        <div>Decimals</div><div className="font-mono">{decimals}</div>
        <div>Total Supply</div><div className="font-mono">{supply}</div>
      </div>
    </section>
  )
}

function Balance({ address }) {
  const [balance, setBalance] = useState('')

  useEffect(() => {
    if (!address) return
    const run = async () => {
      const json = cvToJSON(await ro('get-balance', [principalCV(address)], address))
      setBalance(json.value)
    }
    run()
  }, [address])

  return (
    <section className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">My Balance</h2>
      <div className="font-mono">{address ? balance : 'Connect wallet'}</div>
    </section>
  )
}

function TransferForm({ address }) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!address) return alert('Connect wallet first')
    await openContractCall({
      userSession,
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'transfer',
      functionArgs: [uintCV(Number(amount)), principalCV(address), principalCV(to), noneCV()],
      appDetails: { name: 'PSHT Frontend', icon: window.location.origin + '/vite.svg' },
      onFinish: (data) => console.log('tx submitted', data),
    })
  }

  return (
    <section className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Transfer</h2>
      <form onSubmit={submit} className="grid gap-2">
        <input className="border p-2 rounded" placeholder="Recipient STX address" value={to} onChange={e=>setTo(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Amount (uint)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button className="px-4 py-2 rounded bg-black text-white w-fit">Send</button>
      </form>
    </section>
  )
}

function AdminMint() {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    await openContractCall({
      userSession,
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'mint',
      functionArgs: [uintCV(Number(amount)), principalCV(to)],
      appDetails: { name: 'PSHT Frontend', icon: window.location.origin + '/vite.svg' },
      onFinish: (data) => console.log('tx submitted', data),
    })
  }

  return (
    <section className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Admin – Mint</h2>
      <form onSubmit={submit} className="grid gap-2">
        <input className="border p-2 rounded" placeholder="Recipient STX address" value={to} onChange={e=>setTo(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Amount (uint)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button className="px-4 py-2 rounded bg-emerald-600 text-white w-fit">Mint</button>
      </form>
      <p className="text-xs text-gray-500 mt-1">Hanya owner/minter yang akan sukses.</p>
    </section>
  )
}

function BurnForm({ address }) {
  const [amount, setAmount] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!address) return alert('Connect wallet first')
    await openContractCall({
      userSession,
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'burn',
      functionArgs: [uintCV(Number(amount)), principalCV(address)],
      appDetails: { name: 'PSHT Frontend', icon: window.location.origin + '/vite.svg' },
      onFinish: (data) => console.log('tx submitted', data),
    })
  }

  return (
    <section className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Burn</h2>
      <form onSubmit={submit} className="grid gap-2">
        <input className="border p-2 rounded" placeholder="Amount (uint)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <button className="px-4 py-2 rounded bg-rose-600 text-white w-fit">Burn</button>
      </form>
    </section>
  )
}