import { useState } from 'react'
import categories from './categories'
import { ArrowLeft, Settings as SettingsIcon, Users, User, X, Tag } from 'lucide-react'
import LobbySettings, { useLocalLobbySettings } from './LobbySettings'
function Back({ setpage, destination="home", goHome }) {
  return (
    <button
      className="absolute top-1 left-1 border rounded-full bg-black p-2"
      onClick={() => {
        if (destination === 'home') {
          goHome()
        } else {
          setpage(destination)
        }
      }}
    >
      <ArrowLeft size={20} />
    </button>
  )
}

export default function Bots({ goHome }) {
  const [page, setpage] = useState('roomAi')
  const [previouspage, setprevious] = useState('roomAi')
  const localSettings = useLocalLobbySettings()
  const { hintRoundCount } = localSettings
   function changePage(newPage) {
    setprevious(page)
    setpage(newPage)
  }
if(page==='roomAi')
    return(
 <div className="h-screen flex flex-col overflow-hidden">
      <header className="relative p-6 border-b border-white">
          <Back setpage={setpage} destination="home" goHome={goHome} />
          Future Content 
          <button
            className="absolute top-1 right-1 border rounded-full bg-black p-2"
            onClick={() => changePage('lobbysettings')}
          >
            <SettingsIcon size={20} />
          </button>
        </header>
   
      </div>
      )
     if (page === 'lobbysettings')
        return (
          <LobbySettings
            onBack={() => setpage('roomAi')}
            local={localSettings}
          />
        )
      

}