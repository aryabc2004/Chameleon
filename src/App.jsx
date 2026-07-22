import { useState } from 'react'
import categories from './categories'

function Back({ setpage, text="Back", destination="home" }) {
  return (
    <button
      className="absolute top-1 left-1 border rounded-full bg-black p-2"
      onClick={() => setpage(destination)}
    >
      {text}
    </button>
  )
}

function Settings({ setpage }) {
  return (
    <button
      className="absolute top-1 right-1 border rounded-full bg-black p-2"
      onClick={() => setpage('settings')}
    >
      Settings
    </button>
  )
}

export default function App() {
  // --- Navigation state ---
  const [page, setpage] = useState('home')
  const [previouspage, setprevious] = useState('home')
  const code = 12345

  // --- Room / player state ---
  const [players, setplayers] = useState([])
  const [nameinput, setnameinput] = useState('')
  const [error, setError] = useState('')

  // --- Category state ---
  const [selectedCategories, setSelectedCategories] = useState([])

  // --- Round state ---
  const [impostorIndex, setImpostorIndex] = useState(null)
  const [roundCategory, setRoundCategory] = useState(null)
  const [secretWord, setSecretWord] = useState(null)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // --- Hint state ---
  const [hints, setHints] = useState([])
  const [currentRound, setCurrentRound] = useState(1)
  const [hintInput, setHintInput] = useState('')

  // --- Vote state ---
  const [votedPlayer, setVotedPlayer] = useState(null)

  // --- Redemption state ---
  const [guessedWord, setGuessedWord] = useState(null)

  // ----------------- Functions -----------------

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
          <span>{players[i]}</span>
          <button
            className="text-white w-6 h-6 flex items-center justify-center text-2xl"
            onClick={() => removePlayer(i)}
          >
            x
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
      if (currentRound === 1) {
        setCurrentPlayerIndex(0)
        setCurrentRound(2)
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
        <p className="text-3xl font-bold">Players win!!</p>
        <p className="text-gray-400 mt-2">
          {impostorName} guessed "{guessedWord}" — the word was "{secretWord}".
        </p>
       
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
    changePage('home')
  }

  // ----------------- Pages -----------------

  if (page === 'home')
    return (
      <div>
        <header className="p-4 border-b border-white">
          <Settings setpage={changePage} />
          <h1 className="text-9xl font-bold text-center">Chameleon</h1>
        </header>
        <div className="flex flex-col items-center gap-6 mt-10 w-40 mx-auto">
          <button
            className="mt-10 border rounded-full bg-black p-6 w-75"
            onClick={() => changePage('room')}
          >
            Pass and Play
          </button>

          <button
            className="mt-24 border rounded-full bg-black p-6 w-75"
            onClick={() => changePage('lobby')}
          >
            Play Online
          </button>
        </div>
      </div>
    )

  if (page === 'room')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="p-6 border-b border-white">
          <Back setpage={setpage} destination={previouspage} />
          <Settings setpage={changePage} />
        </header>

        <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">

          {/* Box 1 - Player count header */}
          <div className="w-3/4 border rounded-lg bg-gray-910 p-3">
            <div className="flex justify-between items-center text-3xl">
              <span>Player Lobby</span>
              <button className="border rounded-full bg-black px-4 py-2 text-base">
                {players.length}/6
              </button>
            </div>
            <div className="mt-1 text-left">
              <span className="text-sm text-gray-400 block">Add players to begin</span>
            </div>
          </div>

          {/* Box 2 - Add player input */}
          <div className="w-3/4 border rounded-lg bg-gray-910 flex flex-col p-3">
            <div className="flex justify-between items-center">
              <input
                placeholder="Player"
                value={nameinput}
                onChange={(e) => setnameinput(e.target.value)}
                className="w-6/10 border rounded-full bg-black p-4"
              />
              <button
                className="flex-grow ml-3 border rounded-full bg-white text-black p-5"
                onClick={addplayer}
              >
                Add Player+
              </button>
            </div>
            {error && <span className="text-red-400 text-sm mt-2">{error}</span>}
          </div>

          {/* Box 3 - Player list */}
          <div className="w-3/4 border rounded-lg bg-gray-910 p-3 max-h-40 overflow-y-auto">
            {renderPlayerList()}
          </div>

          {/* Continue button */}
          <button
            className={
              players.length >= 4
                ? "w-3/4 border rounded-full bg-white text-black p-5 text-xl"
                : "w-3/4 border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
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
        <header className="p-6 border-b border-white">
          <Back setpage={setpage} destination={previouspage} />
          <Settings setpage={changePage} />
        </header>

        <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">

          <div className="w-3/4 border rounded-lg bg-gray-910 p-3 h-[60vh] overflow-y-auto">
            {renderCategories()}
          </div>

          <button
            className={
              selectedCategories.length >= 1
                ? "w-3/4 border rounded-full bg-white text-black p-5 text-xl"
                : "w-3/4 border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
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
        <header className="p-6 border-b border-white">
          <Settings setpage={changePage} />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          <p className="text-sm text-gray-400">{players[currentPlayerIndex]}'s turn</p>

          <div
            className="w-1/2 h-3/4 border rounded-lg bg-gray-910 flex items-center justify-center"
            onClick={() => setRevealed(true)}
          >
            {rolereveal()}
          </div>

          <button
            className={
              revealed
                ? "w-1/2 border rounded-full bg-gray-500 text-gray-300 p-4"
                : "w-1/2 border rounded-full bg-white text-black p-4"
            }
            disabled={revealed}
            onClick={() => setRevealed(true)}
          >
            Tap to Reveal
          </button>

          <button
            className={
              revealed
                ? "w-1/2 border rounded-full bg-white text-black p-4"
                : "w-1/2 border rounded-full bg-gray-500 text-gray-300 p-4"
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
        <header className="p-6 border-b border-white">
          <Settings setpage={changePage} />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          <p className="text-2xl font-bold">Write a Hint</p>
          <p className="text-sm text-gray-400">Round {currentRound} — {players[currentPlayerIndex]}'s turn</p>

          <input
            placeholder="Your hint..."
            value={hintInput}
            onChange={(e) => setHintInput(e.target.value)}
            className="w-3/4 border rounded-full bg-black p-4"
          />

          <button
            className="w-3/4 border rounded-full bg-white text-black p-4"
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
        <header className="p-6 border-b border-white">
          <Settings setpage={changePage} />
        </header>

        <div className="flex-1 flex flex-col items-center gap-4 px-4 overflow-y-auto py-4">

          <p className="text-2xl font-bold">Review Hints</p>
          <div className="w-3/4 border rounded-lg bg-gray-910 p-3 max-h-60 overflow-y-auto">
            {renderHints()}
          </div>

          <p className="text-2xl font-bold mt-4">Vote Out a Player</p>
          <div className="w-3/4 border rounded-lg bg-gray-910 p-3">
            {renderVoteButtons()}
          </div>

          <button
            className="w-3/4 border rounded-full bg-white text-black p-4 mb-4"
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
        <header className="p-6 border-b border-white">
          <Settings setpage={changePage} />
        </header>

        <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">

          <div className="text-center px-4">
            <p className="text-2xl font-bold">You've been caught!</p>
            <p className="text-gray-400 mt-2">Guess the secret word to win</p>
          </div>

          <div className="w-3/4 border rounded-lg bg-gray-910 p-3 max-h-60 overflow-y-auto">
            {renderWordChoices()}
          </div>

          <button
            className={
              guessedWord
                ? "w-3/4 border rounded-full bg-white text-black p-5 text-xl"
                : "w-3/4 border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
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
        <header className="p-6 border-b border-white">
          <Settings setpage={changePage} />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          {renderResult()}

          <button
            className="w-3/4 border rounded-full bg-white text-black p-4"
            onClick={resetGame}
          >
            Play Again
          </button>

        </div>
      </div>
    )

  if (page === 'lobby')
    return (
      <div>
        <header className="p-6 border-b border-white">
          <Back setpage={setpage} destination={previouspage} />
          <Settings setpage={changePage} />
        </header>

        <div className="flex justify-center mt-40 bg-gray">
          <div className="w-100 h-100 border rounded-lg bg-gray-910">

            <div className="h-1/2 border-b border-white">
              <input
                placeholder="Enter your name..."
                className="mt-10 w-9/10 border rounded-full bg-black p-4"
              />
              <button
                className="mt-5 w-9/10 border rounded-full bg-white text-black p-4"
                onClick={() => changePage('host')}
              >
                + Create Lobby
              </button>
            </div>

            <div className="h-1/2">
              <input
                placeholder="Enter your name..."
                className="mt-10 w-9/10 border rounded-full bg-black p-4"
              />
              <button
                className="mt-5 w-9/10 border rounded-full text-black bg-white p-4"
                onClick={() => changePage('host')}
              >
                Join Lobby
              </button>
            </div>

          </div>
        </div>
      </div>
    )

  if (page === 'host')
    return (
      <div>
        <header className="p-6 border-b border-white">
          <Back setpage={setpage} text="Leave" />
          <h1 className="text-4xl"> Lobby Code: {code}</h1>
          <Settings setpage={changePage} />
        </header>
        <h1 className="text-4xl flex justify-between px-15">
          <span>Lobby Members</span>
          <span>{players.length}/9</span>
        </h1>
        <div></div>
      </div>
    )

  if (page === 'settings')
    return (
      <div>
        <header className="p-6 border-b border-white">
          <Back setpage={setpage} destination={previouspage} />
          <h1 className="text-4xl font-bold text-center">Settings</h1>
        </header>
      </div>
    )
}