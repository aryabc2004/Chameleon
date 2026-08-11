import { ArrowLeft, LogIn, LogOut, UserCircle } from 'lucide-react'

export default function Settings({ goHome, user, signIn, logOut }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="relative p-6 border-b border-white">
        <button
          className="absolute top-1 left-1 border rounded-full bg-black p-2"
          onClick={goHome}
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