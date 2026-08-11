import { ArrowLeft, Minus, Plus } from 'lucide-react'

function ToggleSwitch({ label, description, value, onToggle }) {
  return (
    <div className="w-full flex justify-between items-center gap-4 py-3">
      <div className="text-left">
        <p className="text-base">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={
          value
            ? "w-14 h-8 rounded-full bg-white flex items-center px-1 justify-end shrink-0"
            : "w-14 h-8 rounded-full bg-gray-600 flex items-center px-1 justify-start shrink-0"
        }
      >
        <span className="w-6 h-6 rounded-full bg-black block"></span>
      </button>
    </div>
  )
}

export default function LobbySettingsPanel({
  onBack,
  hintRoundCount,
  onHintRoundChange,
  imposterSeesCategory,
  onToggleImposterSeesCategory,
  imposterPicksFromList,
  onToggleImposterPicksFromList,
  tieIsDraw,
  onToggleTieIsDraw
}) {
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

        <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-4">
          <p className="text-lg mb-3 text-left">Hint Rounds</p>
          <div className="flex items-center justify-center gap-6">
            <button
              className="border rounded-full bg-black p-3"
              disabled={hintRoundCount <= 1}
              onClick={() => onHintRoundChange(hintRoundCount - 1)}
            >
              <Minus size={20} />
            </button>
            <span className="text-3xl font-bold w-10 text-center">{hintRoundCount}</span>
            <button
              className="border rounded-full bg-black p-3"
              disabled={hintRoundCount >= 4}
              onClick={() => onHintRoundChange(hintRoundCount + 1)}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-4 divide-y divide-gray-700">
          <ToggleSwitch
            label="Impostor Sees Category"
            description="Impostor is shown the round's category name"
            value={imposterSeesCategory}
            onToggle={onToggleImposterSeesCategory}
          />
          <ToggleSwitch
            label="Impostor Picks From List"
            description="Impostor selects a word instead of typing hints"
            value={imposterPicksFromList}
            onToggle={onToggleImposterPicksFromList}
          />
          <ToggleSwitch
            label={tieIsDraw ? "Tie = Draw" : "Tie = Impostor Win"}
            description="What happens when the final vote ties"
            value={tieIsDraw}
            onToggle={onToggleTieIsDraw}
          />
        </div>

      </div>
    </div>
  )
}