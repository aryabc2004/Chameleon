import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import { ArrowLeft, Minus, Plus } from 'lucide-react'

// Single source of truth for default setting values.
// Used both for a fresh online lobby doc and for local pass-and-play state.
export const DEFAULT_LOBBY_SETTINGS = {
  hintRoundCount: 2,
  imposterSeesCategory: true,
  imposterPicksFromList: true,
  tieIsDraw: true
}

// Local-device state hook, for PassAndPlay (single-device) use only.
// Online mode doesn't use this — its settings live directly on the
// Firestore lobby doc instead, handled inside LobbySettings itself below.
export function useLocalLobbySettings() {
  const [hintRoundCount, setHintRoundCount] = useState(DEFAULT_LOBBY_SETTINGS.hintRoundCount)
  const [imposterSeesCategory, setImposterSeesCategory] = useState(DEFAULT_LOBBY_SETTINGS.imposterSeesCategory)
  const [imposterPicksFromList, setImposterPicksFromList] = useState(DEFAULT_LOBBY_SETTINGS.imposterPicksFromList)
  const [tieIsDraw, setTieIsDraw] = useState(DEFAULT_LOBBY_SETTINGS.tieIsDraw)

  return {
    hintRoundCount, setHintRoundCount,
    imposterSeesCategory, setImposterSeesCategory,
    imposterPicksFromList, setImposterPicksFromList,
    tieIsDraw, setTieIsDraw
  }
}

function ToggleSwitch({ label, description, value, onToggle, disabled }) {
  return (
    <div className="w-full flex justify-between items-center gap-4 py-3">
      <div className="text-left">
        <p className="text-base">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={
          value
            ? "w-14 h-8 rounded-full bg-white flex items-center px-1 justify-end shrink-0 disabled:opacity-40"
            : "w-14 h-8 rounded-full bg-gray-600 flex items-center px-1 justify-start shrink-0 disabled:opacity-40"
        }
      >
        <span className="w-6 h-6 rounded-full bg-black block"></span>
      </button>
    </div>
  )
}

// Two ways to use this component:
//
// LOCAL (pass-and-play): pass `local={useLocalLobbySettings()}`.
//   isHost defaults to true since there's only one device.
//
// ONLINE: pass `roomCode` and `lobby` (the live Firestore doc data)
//   instead of `local`. This component writes directly to Firestore
//   via updateDoc — Online.jsx doesn't need its own handlers.
//   Pass `isHost` explicitly so non-hosts see a disabled, read-only view.
export default function LobbySettings({ onBack, isHost = true, roomCode, lobby, local }) {
  const online = Boolean(roomCode)

  const hintRoundCount = online ? lobby.hintRoundCount : local.hintRoundCount
  const imposterSeesCategory = online ? lobby.imposterSeesCategory : local.imposterSeesCategory
  const imposterPicksFromList = online ? lobby.imposterPicksFromList : local.imposterPicksFromList
  const tieIsDraw = online ? lobby.tieIsDraw : local.tieIsDraw

  function updateSetting(field, value) {
    if (!isHost) return

    if (online) {
      updateDoc(doc(db, 'lobbies', roomCode), { [field]: value })
    } else {
      if (field === 'hintRoundCount') local.setHintRoundCount(value)
      if (field === 'imposterSeesCategory') local.setImposterSeesCategory(value)
      if (field === 'imposterPicksFromList') local.setImposterPicksFromList(value)
      if (field === 'tieIsDraw') local.setTieIsDraw(value)
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="relative p-6 border-b border-white">
        <button
          className="absolute top-1 left-1 border rounded-full bg-black p-2"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-center">Lobby Settings</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 overflow-y-auto py-4">

        {!isHost && (
          <p className="text-sm text-gray-400 text-center px-4">Only the host can change lobby settings</p>
        )}

        <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-4">
          <p className="text-lg mb-3 text-left">Hint Rounds</p>
          <div className="flex items-center justify-center gap-6">
            <button
              className="border rounded-full bg-black p-3 disabled:opacity-40"
              disabled={!isHost || hintRoundCount <= 1}
              onClick={() => updateSetting('hintRoundCount', hintRoundCount - 1)}
            >
              <Minus size={20} />
            </button>
            <span className="text-3xl font-bold w-10 text-center">{hintRoundCount}</span>
            <button
              className="border rounded-full bg-black p-3 disabled:opacity-40"
              disabled={!isHost || hintRoundCount >= 4}
              onClick={() => updateSetting('hintRoundCount', hintRoundCount + 1)}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-4 divide-y divide-gray-700">
          <ToggleSwitch
            label={imposterSeesCategory ? "Impostor Sees Category" : "Impostor Sees Nothing"}
            description="Whether the impostor is shown the round's category"
            value={imposterSeesCategory}
            disabled={!isHost}
            onToggle={() => updateSetting('imposterSeesCategory', !imposterSeesCategory)}
          />
          <ToggleSwitch
            label={imposterPicksFromList ? "Impostor Picks From List" : "Impostor Types Hint"}
            description="How the impostor participates in hint rounds"
            value={imposterPicksFromList}
            disabled={!isHost}
            onToggle={() => updateSetting('imposterPicksFromList', !imposterPicksFromList)}
          />
          <ToggleSwitch
            label={tieIsDraw ? "Tie = Draw" : "Tie = Impostor Win"}
            description="What happens when the final vote ties"
            value={tieIsDraw}
            disabled={!isHost}
            onToggle={() => updateSetting('tieIsDraw', !tieIsDraw)}
          />
        </div>

      </div>
    </div>
  )
}