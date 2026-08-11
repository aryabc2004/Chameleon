import { useState, useEffect } from 'react'
import { db } from './firebase'
import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import categories from './categories'
import { ArrowLeft, LogOut, Users, User, Tag, Settings as SettingsIcon, Minus, Plus } from 'lucide-react'

export default function Online({ goHome }) {
  const [page, setpage] = useState('menu')
  const [nameInput, setNameInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [playerId, setPlayerId] = useState('')
  const [lobby, setLobby] = useState(null)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)
  const [hintInput, setHintInput] = useState('')

  async function createLobby() {
    if (nameInput.trim() === '') {
      setError('Please enter a name')
      return
    }

    let code = Math.floor(100000 + Math.random() * 900000).toString()
    let id = crypto.randomUUID()

    let newLobby = {
      code: code,
      hostId: id,
      players: [{ id: id, name: nameInput.trim() }],
      status: 'waiting',
      selectedCategories: [],
      roundCategory: null,
      secretWord: null,
      impostorId: null,
      turnOrder: [],
      currentTurnIndex: 0,
      currentRound: 1,
      hintRoundCount: 2,
      hints: [],
      readyIds: [],
      votes: {},
      votedPlayer: null,
      guessedWord: null
    }

    await setDoc(doc(db, 'lobbies', code), newLobby)

    setRoomCode(code)
    setPlayerId(id)
    setError('')
    setpage('waitingroom')
  }

  async function joinLobby() {
    if (joining) return
    setJoining(true)

    if (nameInput.trim() === '') {
      setError('Please enter a name')
      setJoining(false)
      return
    }
    if (codeInput.trim() === '') {
      setError('Please enter a room code')
      setJoining(false)
      return
    }

    let lobbyRef = doc(db, 'lobbies', codeInput.trim())
    let snap = await getDoc(lobbyRef)

    if (!snap.exists()) {
      setError('Room not found')
      setJoining(false)
      return
    }

    let id = crypto.randomUUID()

    await updateDoc(lobbyRef, {
      players: arrayUnion({ id: id, name: nameInput.trim() })
    })

    setRoomCode(codeInput.trim())
    setPlayerId(id)
    setError('')
    setJoining(false)
    setpage('waitingroom')
  }

  async function leaveLobby() {
    if (roomCode !== '') {
      let snap = await getDoc(doc(db, 'lobbies', roomCode))
      if (snap.exists()) {
        let data = snap.data()
        let me = null
        for (let i = 0; i < data.players.length; i++) {
          if (data.players[i].id === playerId) {
            me = data.players[i]
          }
        }
        if (me !== null) {
          await updateDoc(doc(db, 'lobbies', roomCode), {
            players: arrayRemove(me)
          })
        }
      }
    }
    goHome()
  }

  useEffect(() => {
    if (roomCode === '') return

    const unsub = onSnapshot(doc(db, 'lobbies', roomCode), (snap) => {
      setLobby(snap.data())
    })

    return () => unsub()
  }, [roomCode])

  useEffect(() => {
    if (!lobby) return
    if (playerId !== lobby.hostId) return
    if (lobby.status !== 'reveal') return
    if (!lobby.readyIds) return

    if (lobby.readyIds.length >= lobby.players.length) {
      updateDoc(doc(db, 'lobbies', roomCode), { status: 'hints' })
    }
  }, [lobby, playerId, roomCode])

  useEffect(() => {
    if (!lobby) return
    if (playerId !== lobby.hostId) return
    if (lobby.status !== 'vote') return
    if (!lobby.votes) return

    let voteCount = Object.keys(lobby.votes).length
    if (voteCount < lobby.players.length) return

    let result = tallyVotes()

    if (result.isTie) {
      updateDoc(doc(db, 'lobbies', roomCode), {
        status: 'tie',
        votes: {}
      })
    } else if (result.leaderId === lobby.impostorId) {
      updateDoc(doc(db, 'lobbies', roomCode), {
        status: 'redemption',
        votedPlayer: result.leaderId
      })
    } else {
      updateDoc(doc(db, 'lobbies', roomCode), {
        status: 'result',
        votedPlayer: result.leaderId
      })
    }
  }, [lobby, playerId, roomCode])

  async function toggleCategory(name) {
    if (!lobby) return

    let updated = []
    let alreadyIn = false

    for (let i = 0; i < lobby.selectedCategories.length; i++) {
      if (lobby.selectedCategories[i] === name) {
        alreadyIn = true
      } else {
        updated.push(lobby.selectedCategories[i])
      }
    }

    if (!alreadyIn) {
      updated.push(name)
    }

    await updateDoc(doc(db, 'lobbies', roomCode), { selectedCategories: updated })
  }

  function renderCategoriesOnline() {
    let categoryNames = Object.keys(categories)
    let boxes = []

    for (let i = 0; i < categoryNames.length; i++) {
      let name = categoryNames[i]
      let isSelected = lobby.selectedCategories.includes(name)

      boxes.push(
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

    return <div className="flex flex-col gap-2">{boxes}</div>
  }

  async function beginRound() {
    let randomPlayerIndex = Math.floor(Math.random() * lobby.players.length)
    let impostor = lobby.players[randomPlayerIndex]

    let randomCategoryIndex = Math.floor(Math.random() * lobby.selectedCategories.length)
    let category = lobby.selectedCategories[randomCategoryIndex]
    let words = categories[category]
    let randomWordIndex = Math.floor(Math.random() * words.length)

    let turnOrder = []
    for (let i = 0; i < lobby.players.length; i++) {
      turnOrder.push(lobby.players[i].id)
    }

    await updateDoc(doc(db, 'lobbies', roomCode), {
      impostorId: impostor.id,
      roundCategory: category,
      secretWord: words[randomWordIndex],
      turnOrder: turnOrder,
      currentTurnIndex: 0,
      currentRound: 1,
      hints: [],
      readyIds: [],
      votes: {},
      votedPlayer: null,
      guessedWord: null,
      status: 'reveal'
    })
  }

  async function markReady() {
    await updateDoc(doc(db, 'lobbies', roomCode), {
      readyIds: arrayUnion(playerId)
    })
  }

  function amIReady() {
    if (!lobby.readyIds) return false
    return lobby.readyIds.includes(playerId)
  }

  function isMyTurn() {
    if (!lobby.turnOrder || lobby.turnOrder.length === 0) return false
    return lobby.turnOrder[lobby.currentTurnIndex] === playerId
  }

  function myName() {
    for (let i = 0; i < lobby.players.length; i++) {
      if (lobby.players[i].id === playerId) return lobby.players[i].name
    }
    return ''
  }

  function nameForId(id) {
    for (let i = 0; i < lobby.players.length; i++) {
      if (lobby.players[i].id === id) return lobby.players[i].name
    }
    return ''
  }

  async function submitHint() {
    if (hintInput.trim() === '') return

    let newHint = { playerId: playerId, player: myName(), round: lobby.currentRound, hint: hintInput.trim() }
    let newHints = [...lobby.hints, newHint]

    let updates = { hints: newHints }

    if (lobby.currentTurnIndex >= lobby.turnOrder.length - 1) {
      if (lobby.currentRound < lobby.hintRoundCount) {
        updates.currentTurnIndex = 0
        updates.currentRound = lobby.currentRound + 1
      } else {
        updates.status = 'vote'
      }
    } else {
      updates.currentTurnIndex = lobby.currentTurnIndex + 1
    }

    await updateDoc(doc(db, 'lobbies', roomCode), updates)
    setHintInput('')
  }

  function renderHintsReview() {
    let rows = []
    for (let i = 0; i < lobby.hints.length; i++) {
      rows.push(
        <div key={i} className="border rounded-lg bg-black p-3">
          <span className="text-gray-400 text-sm">Round {lobby.hints[i].round} — {lobby.hints[i].player}</span>
          <p>{lobby.hints[i].hint}</p>
        </div>
      )
    }
    return <div className="flex flex-col gap-2">{rows}</div>
  }

  async function castVote(votedForId) {
    let newVotes = { ...lobby.votes }
    newVotes[playerId] = votedForId
    await updateDoc(doc(db, 'lobbies', roomCode), { votes: newVotes })
  }

  function myVote() {
    if (!lobby.votes) return null
    return lobby.votes[playerId] || null
  }

  function tallyVotes() {
    let counts = {}
    let voterIds = Object.keys(lobby.votes)

    for (let i = 0; i < voterIds.length; i++) {
      let votedFor = lobby.votes[voterIds[i]]
      if (!counts[votedFor]) {
        counts[votedFor] = 0
      }
      counts[votedFor] = counts[votedFor] + 1
    }

    let highestCount = 0
    let leaderId = null
    let isTie = false

    let candidateIds = Object.keys(counts)
    for (let i = 0; i < candidateIds.length; i++) {
      let id = candidateIds[i]
      if (counts[id] > highestCount) {
        highestCount = counts[id]
        leaderId = id
        isTie = false
      } else if (counts[id] === highestCount) {
        isTie = true
      }
    }

    return { leaderId: leaderId, isTie: isTie }
  }

  function renderVoteButtonsOnline() {
    let buttons = []
    for (let i = 0; i < lobby.players.length; i++) {
      let p = lobby.players[i]
      let isSelected = myVote() === p.id

      let btnClass
      if (isSelected) {
        btnClass = "w-full border rounded-lg bg-white text-black p-4"
      } else {
        btnClass = "w-full border rounded-lg bg-black text-white p-4"
      }

      buttons.push(
        <button key={p.id} onClick={() => castVote(p.id)} className={btnClass}>
          {p.name}
        </button>
      )
    }
    return <div className="flex flex-col gap-2">{buttons}</div>
  }

  async function submitGuess(word) {
    await updateDoc(doc(db, 'lobbies', roomCode), { guessedWord: word, status: 'result' })
  }

  function renderWordChoicesOnline() {
    let words = categories[lobby.roundCategory]
    let buttons = []

    for (let i = 0; i < words.length; i++) {
      let word = words[i]
      buttons.push(
        <button
          key={i}
          onClick={() => submitGuess(word)}
          className="w-full border rounded-lg bg-black text-white p-4"
        >
          {word}
        </button>
      )
    }

    return <div className="flex flex-col gap-2">{buttons}</div>
  }

  function renderResultOnline() {
    let impostorName = nameForId(lobby.impostorId)
    let wasCaught = lobby.votedPlayer === lobby.impostorId

    if (wasCaught === false) {
      return (
        <div className="text-center px-4">
          <p className="text-3xl font-bold">Wrong guess!</p>
          <p className="text-gray-400 mt-2">
            {nameForId(lobby.votedPlayer)} was not the impostor — {impostorName} was.
          </p>
          <p className="mt-4">Impostor wins!</p>
        </div>
      )
    }

    if (lobby.guessedWord === lobby.secretWord) {
      return (
        <div className="text-center px-4">
          <p className="text-3xl font-bold">Caught, but redeemed!</p>
          <p className="text-gray-400 mt-2">
            {impostorName} correctly guessed "{lobby.secretWord}".
          </p>
          <p className="mt-4">Impostor wins!</p>
        </div>
      )
    }

    return (
      <div className="text-center px-4">
        <p className="text-3xl font-bold">You caught the impostor!</p>
        <p className="text-gray-400 mt-2">
          {impostorName} guessed "{lobby.guessedWord}" — the word was "{lobby.secretWord}".
        </p>
        <p className="mt-4">Players win!</p>
      </div>
    )
  }

  async function playAgain() {
    await updateDoc(doc(db, 'lobbies', roomCode), {
      selectedCategories: [],
      roundCategory: null,
      secretWord: null,
      impostorId: null,
      turnOrder: [],
      currentTurnIndex: 0,
      currentRound: 1,
      hints: [],
      readyIds: [],
      votes: {},
      votedPlayer: null,
      guessedWord: null,
      status: 'category'
    })
  }

  if (page === 'menu')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
          <button className="absolute top-1 left-1 border rounded-full bg-black p-2" onClick={goHome}>
            <ArrowLeft size={20} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <input
            placeholder="Enter your name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-11/12 max-w-sm border rounded-full bg-black p-4"
          />

          {error && <span className="text-red-400 text-sm">{error}</span>}

          <button className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4" onClick={createLobby}>
            + Create Lobby
          </button>

          <button className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4" onClick={() => setpage('join')}>
            Join Lobby
          </button>
        </div>
      </div>
    )

  if (page === 'join')
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
          <button className="absolute top-1 left-1 border rounded-full bg-black p-2" onClick={() => setpage('menu')}>
            <ArrowLeft size={20} />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <input
            placeholder="Enter your name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-11/12 max-w-sm border rounded-full bg-black p-4"
          />
          <input
            placeholder="Enter room code..."
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="w-11/12 max-w-sm border rounded-full bg-black p-4"
          />

          {error && <span className="text-red-400 text-sm">{error}</span>}

          <button
            className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4"
            onClick={joinLobby}
            disabled={joining}
          >
            {joining ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    )

  if (page === 'lobbysettings' && lobby)
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="relative p-6 border-b border-white">
          <button
            className="absolute top-1 left-1 border rounded-full bg-black p-2"
            onClick={() => setpage('waitingroom')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-center">Lobby Settings</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">

          <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-4">
            <p className="text-lg mb-3">Hint Rounds</p>
            <div className="flex items-center justify-center gap-6">
              <button
                className="border rounded-full bg-black p-3"
                disabled={lobby.hintRoundCount <= 1}
                onClick={() => updateDoc(doc(db, 'lobbies', roomCode), { hintRoundCount: lobby.hintRoundCount - 1 })}
              >
                <Minus size={20} />
              </button>
              <span className="text-3xl font-bold w-10 text-center">{lobby.hintRoundCount}</span>
              <button
                className="border rounded-full bg-black p-3"
                disabled={lobby.hintRoundCount >= 4}
                onClick={() => updateDoc(doc(db, 'lobbies', roomCode), { hintRoundCount: lobby.hintRoundCount + 1 })}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    )

  if (page === 'waitingroom') {
    if (!lobby) {
      return (
        <div className="h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      )
    }

    let isHost = playerId === lobby.hostId

    if (lobby.status === 'waiting') {
      let playerBoxes = []
      for (let i = 0; i < lobby.players.length; i++) {
        playerBoxes.push(
          <div key={lobby.players[i].id} className="border rounded-lg bg-black p-3 mb-2 flex items-center gap-2">
            <User size={16} />
            {lobby.players[i].name}
          </div>
        )
      }

      return (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="relative p-6 border-b border-white">
            <button className="absolute top-1 left-1 border rounded-full bg-black p-2" onClick={leaveLobby}>
              <LogOut size={20} />
            </button>
            {isHost && (
              <button
                className="absolute top-1 right-1 border rounded-full bg-black p-2"
                onClick={() => setpage('lobbysettings')}
              >
                <SettingsIcon size={20} />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl text-center">Room Code: {roomCode}</h1>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
            <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3">
              <p className="text-xl mb-2 flex items-center justify-center gap-2">
                <Users size={20} />
                Players ({lobby.players.length})
              </p>
              {playerBoxes}
            </div>

            {isHost ? (
              <button
                className={
                  lobby.players.length >= 3
                    ? "w-11/12 max-w-md border rounded-full bg-white text-black p-5 text-xl"
                    : "w-11/12 max-w-md border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
                }
                disabled={lobby.players.length < 3}
                onClick={() => updateDoc(doc(db, 'lobbies', roomCode), { status: 'category' })}
              >
                Continue
              </button>
            ) : (
              <p className="text-gray-400">Waiting for host to start...</p>
            )}
          </div>
        </div>
      )
    }

    if (lobby.status === 'category') {
      return (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="relative p-6 border-b border-white">
            <h1 className="text-xl sm:text-2xl text-center">Choose Categories</h1>
          </header>

          <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">
            <p className="text-2xl font-bold flex items-center gap-2">
              <Tag size={20} />
              Categories
            </p>

            <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3 h-[60vh] overflow-y-auto">
              {isHost ? renderCategoriesOnline() : <p className="text-gray-400">Waiting for host to pick categories...</p>}
            </div>

            {isHost && (
              <button
                className={
                  lobby.selectedCategories.length >= 1
                    ? "w-11/12 max-w-md border rounded-full bg-white text-black p-5 text-xl"
                    : "w-11/12 max-w-md border rounded-full bg-gray-500 text-gray-300 p-5 text-xl"
                }
                disabled={lobby.selectedCategories.length === 0}
                onClick={beginRound}
              >
                Begin
              </button>
            )}
          </div>
        </div>
      )
    }

    if (lobby.status === 'reveal') {
      let isImpostor = playerId === lobby.impostorId

      return (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="relative p-6 border-b border-white">
            <h1 className="text-xl sm:text-2xl text-center">Your Role</h1>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
            <div className="w-11/12 max-w-sm h-1/2 border rounded-lg bg-gray-910 flex items-center justify-center">
              {isImpostor ? (
                <div className="text-center px-4">
                  <p className="text-2xl font-bold">You're the Impostor!</p>
                  <p className="text-gray-400 mt-2">Category: {lobby.roundCategory}</p>
                </div>
              ) : (
                <div className="text-center px-4">
                  <p className="text-sm text-gray-400">Secret Word</p>
                  <p className="text-2xl font-bold">{lobby.secretWord}</p>
                </div>
              )}
            </div>

            <button
              className={
                amIReady()
                  ? "w-11/12 max-w-sm border rounded-full bg-gray-500 text-gray-300 p-4"
                  : "w-11/12 max-w-sm border rounded-full bg-white text-black p-4"
              }
              disabled={amIReady()}
              onClick={markReady}
            >
              {amIReady() ? 'Waiting for others...' : "I've seen my role"}
            </button>

            <p className="text-sm text-gray-400">
              {lobby.readyIds ? lobby.readyIds.length : 0}/{lobby.players.length} ready
            </p>
          </div>
        </div>
      )
    }

    if (lobby.status === 'hints') {
      let myTurn = isMyTurn()
      let currentTurnName = nameForId(lobby.turnOrder[lobby.currentTurnIndex])

      return (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="relative p-6 border-b border-white">
            <h1 className="text-xl sm:text-2xl text-center">Round {lobby.currentRound}</h1>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
            {myTurn ? (
              <>
                <p className="text-2xl font-bold text-center">Write a Hint</p>
                <input
                  placeholder="Your hint..."
                  value={hintInput}
                  onChange={(e) => setHintInput(e.target.value)}
                  className="w-11/12 max-w-sm border rounded-full bg-black p-4"
                />
                <button className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4" onClick={submitHint}>
                  Submit
                </button>
              </>
            ) : (
              <p className="text-gray-400 text-lg sm:text-xl text-center">Waiting for {currentTurnName} to write a hint...</p>
            )}
          </div>
        </div>
      )
    }

    if (lobby.status === 'vote') {
      return (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="relative p-6 border-b border-white">
            <h1 className="text-xl sm:text-2xl text-center">Vote</h1>
          </header>

          <div className="flex-1 flex flex-col items-center gap-4 px-4 overflow-y-auto py-4">
            <p className="text-2xl font-bold">Review Hints</p>
            <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3 max-h-60 overflow-y-auto">
              {renderHintsReview()}
            </div>

            <p className="text-2xl font-bold mt-4">Vote Out a Player</p>
            <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3">
              {renderVoteButtonsOnline()}
            </div>

            <p className="text-gray-400 text-sm">
              {lobby.votes ? Object.keys(lobby.votes).length : 0}/{lobby.players.length} voted
            </p>
          </div>
        </div>
      )
    }

    if (lobby.status === 'tie') {
      let isHostHere = playerId === lobby.hostId

      return (
        <div className="h-screen flex flex-col items-center justify-center gap-6 px-4">
          <p className="text-3xl font-bold text-center">It's a tie!</p>
          <p className="text-gray-400 text-center">Another round of hints, then vote again.</p>

          {isHostHere ? (
            <button
              className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4"
              onClick={() =>
                updateDoc(doc(db, 'lobbies', roomCode), {
                  currentRound: lobby.currentRound + 1,
                  currentTurnIndex: 0,
                  status: 'hints'
                })
              }
            >
              Continue
            </button>
          ) : (
            <p className="text-gray-400">Waiting for host to continue...</p>
          )}
        </div>
      )
    }

    if (lobby.status === 'redemption') {
      let isImpostor = playerId === lobby.impostorId

      return (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="relative p-6 border-b border-white">
            <h1 className="text-xl sm:text-2xl text-center">Redemption</h1>
          </header>

          <div className="flex-1 flex flex-col items-center justify-evenly px-4 overflow-hidden">
            {isImpostor ? (
              <>
                <div className="text-center px-4">
                  <p className="text-2xl font-bold">You've been caught!</p>
                  <p className="text-gray-400 mt-2">Guess the secret word to win</p>
                </div>
                <div className="w-11/12 max-w-md border rounded-lg bg-gray-910 p-3 max-h-60 overflow-y-auto">
                  {renderWordChoicesOnline()}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-lg sm:text-xl text-center">Waiting for {nameForId(lobby.impostorId)} to guess...</p>
            )}
          </div>
        </div>
      )
    }

    if (lobby.status === 'result') {
      let isHostHere = playerId === lobby.hostId

      return (
        <div className="h-screen flex flex-col overflow-hidden">
          <header className="relative p-6 border-b border-white">
            <button className="absolute top-1 left-1 border rounded-full bg-black p-2" onClick={leaveLobby}>
              <LogOut size={20} />
            </button>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
            {renderResultOnline()}

            {isHostHere ? (
              <button className="w-11/12 max-w-sm border rounded-full bg-white text-black p-4" onClick={playAgain}>
                Play Again
              </button>
            ) : (
              <p className="text-gray-400">Waiting for host to start a new round...</p>
            )}
          </div>
        </div>
      )
    }
  }
}