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
      <div>
        <header className="p-4 border-b border-white">
          <button
            className="absolute top-1 right-1 border rounded-full bg-black p-2"
            onClick={() => changePage('settings')}
          >
            Settings
          </button>
          <h1 className="text-9xl font-bold text-center">Chameleon</h1>
        </header>
        <div className="flex flex-col items-center gap-6 mt-10 w-40 mx-auto">
          <button
            className="mt-10 border rounded-full bg-black p-6 w-75"
            onClick={() => changePage('passandplay')}
          >
            Pass and Play
          </button>

          <button
            className="mt-24 border rounded-full bg-black p-6 w-75"
            onClick={() => changePage('online')}
          >
            Play Online
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
        <header className="p-6 border-b border-white">
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