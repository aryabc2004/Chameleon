import { useState } from 'react'
import { ArrowLeft, Settings as SettingsIcon, Users, User, X, Tag, Minus, Plus } from 'lucide-react'
import categories from './categories'

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

export default function PassAndPlay({ goHome }) {
  const [page, setpage] = useState('room')
  const [previouspage, setprevious] = useState('room')

  const [players, setplayers] = useState([])
  const [nameinput, setnameinput] = useState('')
  const [error, setError] = useState('')

  const [selectedCategories, setSelectedCategories] = useState([])

  const [impostorIndex, setImpostorIndex] = useState(null)
  const [roundCategory, setRoundCategory] = useState(null)
  const [secretWord, setSecretWord] = useState(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const [hints, setHints] = useState([])
  const [currentRound, setCurrentRound] = useState(1)
  const [hintInput, setHintInput] = useState('')
  const [hintRoundCount, setHintRoundCount] = useState(2)

  const [votedPlayer, setVotedPlayer] = useState(null)
  const [guessedWord, setGuessedWord] = useState(null)

  function changePage(newPage) {
    setprevious(page)
    setpage(newPage)
  }

  function addplayer() {
    if (players.length >= 6) {
      setError('Lobby is full (max 6 players)')
      return
    }
    if (nameinput.trim() === '') {
      setError('Please enter a name')
      return
    }

    setError('')
    setplayers([...players, nameinput.trim()])
    setnameinput('')
  }

  function removePlayer(index) {
    let updatedPlayers = []
    for (let i = 0; i < players.length; i++) {
      if (i !== index) {
        updatedPlayers.push(players[i])
      }
    }
    setplayers(updatedPlayers)
  }

  function renderPlayerList() {
    if (players.length === 0) {
      return <span className="text-gray-400">No Players Yet</span>
    }

    let playerBoxes = []
    for (let i = 0; i < players.length; i++) {
      playerBoxes.push(
        <div key={i} className="border rounded-lg bg-black p-3 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <User size={16} />
            {players[i]}
          </span>
          <button
            className="text-white w-6 h-6 flex items-center justify-center"
            onClick={() => removePlayer(i)}
          >
            <X size={18} />
          </button>
        </div>
      )
    }
    return <div className="flex flex-col gap-2">{playerBoxes}</div>
  }

  function toggleCategory(name) {
    if (selectedCategories.includes(name)) {
      let updated = []
      for (let i = 0; i < selectedCategories.length; i++) {
        if (selectedCategories[i] !== name) {
          updated.push(selectedCategories[i])
        }
      }
      setSelectedCategories(updated)
    } else {
      setSelectedCategories([...selectedCategories, name])
    }
  }

  function renderCategories() {
    let categoryNames = Object.keys(categories)
    let categoryBoxes = []

    for (let i = 0; i < categoryNames.length; i++) {
      let name = categoryNames[i]
      let isSelected = selectedCategories.includes(name)

      categoryBoxes.push(
        <button
          key={i}
          onClick={() => toggleCategory(name)}
          className={
            isSelected
              ? "w-full border rounded-lg bg-white text-black p-4 text-left"
              : "w-full border rounded-lg bg-black text-white p-4 text-left"
          }
        >
          {name}
        </button>
      )
    }

    return <div className="flex flex-col gap-2">{categoryBoxes}</div>
  }

  function assignRound() {
    let randomPlayerIndex = Math.floor(Math.random() * players.length)
    setImpostorIndex(randomPlayerIndex)

    let randomCategoryIndex = Math.floor(Math.random() * selectedCategories.length)
    let category = selectedCategories[randomCategoryIndex]
    let words = categories[category]
    let randomWordIndex = Math.floor(Math.random() * words.length)

    setRoundCategory(category)
    setSecretWord(words[randomWordIndex])
    setCurrentPlayerIndex(0)
    setRevealed(false)
  }

  function rolereveal() {
    if (revealed === false) {
      return (
        <div className="text-center px-4">
          <p className="text-xl font-bold">Tap to Reveal</p>
          <p className="text-sm text-gray-400 mt-2">Don't let others see</p>
        </div>
      )
    }

    if (currentPlayerIndex === impostorIndex) {
      return (
        <div className="text-center px-4">
          <p className="text-2xl font-bold">You're the Impostor!</p>
          <p className="text-gray-400 mt-2">Category: {roundCategory}</p>
        </div>
      )
    }

    return (
      <div className="text-center px-4">
        <p className="text-sm text-gray-400">Secret Word</p>
        <p className="text-2xl font-bold">{secretWord}</p>
      </div>
    )
  }

  function nextReveal() {
    if (currentPlayerIndex >= players.length - 1) {
      setCurrentPlayerIndex(0)
      setRevealed(false)
      changePage('localgame')
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
      setRevealed(false)
    }
  }

  function addHint() {
    if (hintInput.trim() === '') return

    let newHint = { player: players[currentPlayerIndex], round: currentRound, hint: hintInput.trim() }
    setHints([...hints, newHint])
    setHintInput('')

    if (currentPlayerIndex >= players.length - 1) {
      if (currentRound < hintRoundCount) {
        setCurrentPlayerIndex(0)
        setCurrentRound(currentRound + 1)
      } else {
        changePage('vote')
      }
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1)
    }
  }

  function renderHints() {
    let rows = []
    for (let i = 0; i < hints.length; i++) {
      rows.push(
        <div key={i} className="border rounded-lg bg-black p-3">
          <span className="text-gray-400 text-sm">Round {hints[i].round} — {hints[i].player}</span>
          <p>{hints[i].hint}</p>
        </div>
      )
    }
    return <div className="flex flex-col gap-2">{rows}</div>
  }

  function renderVoteButtons() {
    let buttons = []
    for (let i = 0; i < players.length; i++) {
      let name = players[i]
      let isSelected = votedPlayer === name

      let btnClass
      if (isSelected) {
        btnClass = "w-full border rounded-lg bg-white text-black p-4"
      } else {
        btnClass = "w-full border rounded-lg bg-black text-white p-4"
      }

      buttons.push(
        <button key={i} onClick={() => setVotedPlayer(name)} className={btnClass}>
          {name}
        </button>
      )
    }
    return <div className="flex flex-col gap-2">{buttons}</div>
  }

  function renderWordChoices() {
    let words = categories[roundCategory]
    let buttons = []

    for (let i = 0; i < words.length; i++) {
      let word = words[i]
      let isSelected = guessedWord === word

      let btnClass
      if (isSelected) {
        btnClass = "w-full border rounded-lg bg-white text-black p-4"
      } else {
        btnClass = "w-full border rounded-lg bg-black text-white p-4"
      }

      buttons.push(
        <button key={i} onClick={() => setGuessedWord(word)} className={btnClass}>
          {word}
        </button>
      )
    }

    return <div className="flex flex-col gap-2">{buttons}</div>
  }

  function renderResult() {
    let impostorName = players[impostorIndex]
    let wasCaught = votedPlayer === impostorName

    if (wasCaught === false) {
      return (
        <div className="text-center px-4">
          <p className="text-3xl font-bold">Wrong guess!</p>
          <p className="text-gray-400 mt-2">
            {votedPlayer} was not the impostor — {impostorName} was.
          </p>
          <p className="mt-4">Impostor wins!</p>
        </div>
      )
    }

    if (guessedWord === secretWord) {
      return (
        <div className="text-center px-4">
          <p className="text-3xl font-bold">Caught, but redeemed!</p>
          <p className="text-gray-400 mt-2">
            {impostorName} was the impostor, but correctly guessed "{secretWord}".
          </p>
          <p className="mt-4">Impostor wins!</p>
        </div>
      )
    }

    return (
      <div className="text-center px-4">
        <p className="text-3xl font-bold">You caught the impostor!</p>
        <p className="text-gray-400 mt-2">
          {impostorName} guessed "{guessedWord}" — the word was "{secretWord}".
        </p>
        <p className="mt-4">Players win!</p>
      </div>
    )
  }

  function resetGame() {
    setplayers([])
    setHints([])
    setCurrentRound(1)
    setCurrentPlayerIndex(0)
    setRevealed(false)
    setVotedPlayer(null)
    setImpostorIndex(null)
    setSelectedCategories([])
    setRoundCategory(null)
    setSecretWord(null)
    setGuessedWord(null)
    changePage('room')
  }

  if (page === 'room')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
          <Back setpage={setpage} destination="home" goHome={goHome} />
          <button
            className="absolute top-1 right-1 border rounded-full bg-black p-2"
            onClick={() => changePage('lobbysettings')}
          >
            <SettingsIcon size={20} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">

          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3">
            <div className="flex justify-between items-center text-2xl sm:text-3xl">
              <span className="flex items-center gap-2">
                <Users size={22} />
                Player Lobby
              </span>
              <button className="border rounded-full bg-black px-4 py-2 text-base">
                {players.length}/6
              </button>
            </div>
            <div className="mt-1 text-left">
              <span className="text-sm text-gray-400 block">Add players to begin</span>
            </div>
          </div>

          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 flex flex-col p-3">
            <div className="flex justify-between items-center gap-2">
              <input
                placeholder="Player"
                value={nameinput}
                onChange={(e) => setnameinput(e.target.value)}
                className="w-2/3 border rounded-full bg-black p-4"
              />
              <button
                className="flex-grow border rounded-full bg-white text-black p-4"
                onClick={addplayer}
              >
                Add Player+
              </button>
            </div>
            {error && <span className="text-red-400 text-sm mt-2">{error}</span>}
          </div>

          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3 max-h-40 overflow-y-auto">
            {renderPlayerList()}
          </div>

          <button
            className={
              players.length >= 4
                ? "w-11/12 max-w-md border rounded-full bg-white text-black p-5 text-xl"
                : "w-11/12 max-w-md border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
            }
            disabled={players.length < 4}
            onClick={() => changePage('category')}
          >
            Continue
          </button>

        </div>
      </div>
    )

  if (page === 'category')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
          <Back setpage={setpage} destination={previouspage} goHome={goHome} />
        </header>

        <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">

          <p className="text-2xl font-bold flex items-center gap-2">
            <Tag size={20} />
            Categories
          </p>

          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3 h-[60vh] overflow-y-auto">
            {renderCategories()}
          </div>

          <button
            className={
              selectedCategories.length >= 1
                ? "w-11/12 max-w-md border rounded-full bg-white text-black p-5 text-xl"
                : "w-11/12 max-w-md border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
            }
            disabled={selectedCategories.length === 0}
            onClick={() => {
              assignRound()
              changePage('reveal')
            }}
          >
            Begin
          </button>

        </div>
      </div>
    )

  if (page === 'reveal')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          <p className="text-sm text-gray-400">{players[currentPlayerIndex]}'s turn</p>

          <div
            className="w-11/12 max-w-sm h-3/4 border rounded-lg bg-gray-910 flex items-center justify-center"
            onClick={() => setRevealed(true)}
          >
            {rolereveal()}
          </div>

          <button
            className={
              revealed
                ? "w-11/12 max-w-sm border rounded-full bg-gray-500 text-gray-300 p-4"
                : "w-11/12 max-w-sm border rounded-full bg-white text-black p-4"
            }
            disabled={revealed}
            onClick={() => setRevealed(true)}
          >
            Tap to Reveal
          </button>

          <button
            className={
              revealed
                ? "w-11/12 max-w-sm border rounded-full bg-white text-black p-4"
                : "w-11/12 max-w-sm border rounded-full bg-gray-500 text-gray-300 p-4"
            }
            disabled={!revealed}
            onClick={nextReveal}
          >
            Next
          </button>

        </div>
      </div>
    )

  if (page === 'localgame')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          <p className="text-2xl font-bold text-center">Write a Hint</p>
          <p className="text-sm text-gray-400 text-center">Round {currentRound} — {players[currentPlayerIndex]}'s turn</p>

          <input
            placeholder="Your hint..."
            value={hintInput}
            onChange={(e) => setHintInput(e.target.value)}
            className="w-11/12 max-w-sm border rounded-full bg-black p-4"
          />

          <button
            className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4"
            onClick={addHint}
          >
            Next
          </button>

        </div>
      </div>
    )

  if (page === 'vote')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
        </header>

        <div className="flex-1 flex flex-col items-center gap-4 px-4 overflow-y-auto py-4">

          <p className="text-2xl font-bold">Review Hints</p>
          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3 max-h-60 overflow-y-auto">
            {renderHints()}
          </div>

          <p className="text-2xl font-bold mt-4">Vote Out a Player</p>
          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3">
            {renderVoteButtons()}
          </div>

          <button
            className="w-11/12 max-w-md border rounded-full bg-white text-black p-4 mb-4"
            disabled={votedPlayer === null}
            onClick={() => {
              if (votedPlayer === players[impostorIndex]) {
                changePage('redemption')
              } else {
                changePage('result')
              }
            }}
          >
            Confirm Vote
          </button>

        </div>
      </div>
    )

  if (page === 'redemption')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
        </header>

        <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">

          <div className="text-center px-4">
            <p className="text-2xl font-bold">You've been caught!</p>
            <p className="text-gray-400 mt-2">Guess the secret word to win</p>
          </div>

          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3 max-h-60 overflow-y-auto">
            {renderWordChoices()}
          </div>

          <button
            className={
              guessedWord
                ? "w-11/12 max-w-md border rounded-full bg-white text-black p-5 text-xl"
                : "w-11/12 max-w-md border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
            }
            disabled={guessedWord === null}
            onClick={() => changePage('result')}
          >
            Confirm Guess
          </button>

        </div>
      </div>
    )

  if (page === 'result')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          {renderResult()}

          <button
            className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4"
            onClick={resetGame}
          >
            Play Again
          </button>

        </div>
      </div>
    )

  if (page === 'lobbysettings')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
          <Back setpage={setpage} destination="room" goHome={goHome} />
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Lobby Settings</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-4">
            <p className="text-lg mb-3">Hint Rounds</p>
            <div className="flex items-center justify-center gap-6">
              <button
                className="border rounded-full bg-black p-3"
                disabled={hintRoundCount <= 1}
                onClick={() => setHintRoundCount(hintRoundCount - 1)}
              >
                <Minus size={20} />
              </button>
              <span className="text-3xl font-bold w-10 text-center">{hintRoundCount}</span>
              <button
                className="border rounded-full bg-black p-3"
                disabled={hintRoundCount >= 4}
                onClick={() => setHintRoundCount(hintRoundCount + 1)}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    )
}