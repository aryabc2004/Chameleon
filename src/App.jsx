import { useState } from 'react'
import PassAndPlay from './PassAndPlay'
import Online from './Online'

export default function App() {
  const [page, setpage] = useState('home')

  function changePage(newPage) {
    setpage(newPage)
  }

  if (page === 'home')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-4 border-b border-white">
          <button
            className="absolute top-1 right-1 border rounded-full bg-black p-2"
            onClick={() => changePage('settings')}
          >
            Settings
          </button>
          <h1 className="text-[clamp(2.5rem,12vw,6rem)] font-bold text-center break-words">Chameleon</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-evenly px-4">
          <button
            className="border rounded-full bg-black p-6 w-3/4 max-w-xs"
            onClick={() => changePage('passandplay')}
          >
            Pass and Play
          </button>

          <button
            className="border rounded-full bg-black p-6 w-3/4 max-w-xs"
            onClick={() => changePage('online')}
          >
            Play Online
          </button>

          <button
            className="border rounded-full bg-gray-700 text-gray-400 p-6 w-3/4 max-w-xs cursor-not-allowed"
            disabled
          >
            Play with Bots
          </button>
        </div>
      </div>
    )

  if (page === 'passandplay')
    return <PassAndPlay goHome={() => changePage('home')} />

  if (page === 'online')
    return <Online goHome={() => changePage('home')} />

  if (page === 'settings')
    return (
      <div>
        <header className="relative p-6 border-b border-white">
          <button
            className="absolute top-1 left-1 border rounded-full bg-black p-2"
            onClick={() => changePage('home')}
          >
            Back
          </button>
          <h1 className="text-4xl font-bold text-center">Settings</h1>
        </header>
      </div>
    )
}