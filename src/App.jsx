import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, ArrowLeft, Users, Gamepad2, Bot, LogIn, LogOut, UserCircle } from 'lucide-react'
import { auth, googleProvider } from './firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import PassAndPlay from './PassAndPlay'
import Online from './Online'

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
            className="flex items-center justify-center gap-2 border rounded-full bg-gray-700 text-gray-400 p-6 w-3/4 max-w-xs cursor-not-allowed"
            disabled
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

  if (page === 'settings')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
          <button
            className="absolute top-1 left-1 border rounded-full bg-black p-2"
            onClick={() => changePage('home')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-4xl font-bold text-center">Settings</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          {user ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <UserCircle size={48} />
                <p className="text-lg">{user.displayName}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
              <button
                className="flex items-center justify-center gap-2 w-3/4 max-w-xs border rounded-full bg-black p-4"
                onClick={logOut}
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-center px-4">Sign in to save custom categories to your account</p>
              <button
                className="flex items-center justify-center gap-2 w-3/4 max-w-xs border rounded-full bg-white text-black p-4"
                onClick={signIn}
              >
                <LogIn size={20} />
                Sign in with Google
              </button>
            </>
          )}
        </div>
      </div>
    )
}