import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Users, Gamepad2, Bot } from 'lucide-react'
import { auth, googleProvider } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import PassAndPlay from './PassAndPlay'
import Online from './Online'
import Settings from './Settings'
import Bots from './Bots'
//import math

export default function App() {
  const [page, setpage] = useState('home')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsub()
  }, [])

  async function signIn() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  async function logOut() {
    await signOut(auth)
  }

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
            <SettingsIcon size={20} />
          </button>
          <h1 className="text-[clamp(2.5rem,12vw,6rem)] font-bold text-center break-words">Chameleon</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-evenly px-4">
          <button
            className="flex items-center justify-center gap-2 border rounded-full bg-black p-6 w-3/4 max-w-xs"
            onClick={() => changePage('passandplay')}
          >
            <Users size={20} />
            Pass and Play
          </button>

          <button
            className="flex items-center justify-center gap-2 border rounded-full bg-black p-6 w-3/4 max-w-xs"
            onClick={() => changePage('online')}
          >
            <Gamepad2 size={20} />
            Play Online
          </button>

          <button
            className="flex items-center justify-center gap-2 border rounded-full bg-gray-700 text-gray-400 p-6 w-3/4 max-w-xs" 
            onClick={()=> changePage("bots")}    
          >
            <Bot size={20} />
            Play with Bots
          </button>
        </div>
      </div>
    )

  if (page === 'passandplay')
    return <PassAndPlay goHome={() => changePage('home')} />

  if (page === 'online')
    return <Online goHome={() => changePage('home')} />
    
  if (page === 'bots')
    return <Bots goHome={() => changePage('home')} />


  if (page === 'settings')
    return <Settings goHome={() => changePage('home')} user={user} signIn={signIn} logOut={logOut} />
}