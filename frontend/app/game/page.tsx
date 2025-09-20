"use client"
import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

// Use a fixed dev socket URL to avoid referencing `process` in the browser bundle
const SOCKET_URL = typeof window !== 'undefined' ? (window.location.origin.replace(/:3000$/, ':8000') + '/ws') : 'http://localhost:8000/ws'
const socket = io(SOCKET_URL)

export default function GamePage({ searchParams }: { searchParams: { gameId?: string, player?: string } }) {
  const gameId = searchParams.gameId || '1'
  const player = searchParams.player || 'alice'

  const [fen, setFen] = useState('')
  const [moves, setMoves] = useState<any[]>([])
  const [fromSq, setFromSq] = useState('e2')
  const [toSq, setToSq] = useState('e4')

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected', socket.id)
      socket.emit('join_game', { game_id: Number(gameId), player })
    })

    socket.on('move_submitted', (data) => {
      console.log('move_submitted', data)
      // refresh board view
      fetchBoard()
    })

    socket.on('moves_revealed', (data) => {
      console.log('moves_revealed', data)
      // refresh board view
      fetchBoard()
    })

    fetchBoard()

    return () => {
      socket.off('connect')
      socket.off('move_submitted')
      socket.off('moves_revealed')
    }
  }, [gameId, player])

  async function fetchBoard() {
  const res = await fetch(`http://localhost:8000/games/${gameId}/board-view?player=${player}`)
    const j = await res.json()
    setFen(j.fen)
    setMoves(j.moves || [])
  }

  async function submitMove(e: React.FormEvent) {
    e.preventDefault()
  const res = await fetch(`http://localhost:8000/games/${gameId}/moves?player=${player}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_square: fromSq, to_square: toSq })
    })
    if (res.ok) {
      setFromSq('')
      setToSq('')
      fetchBoard()
    } else {
      const err = await res.json()
      alert('Move failed: ' + err.detail)
    }
  }

  return (
    <main>
      <h1>Blind Chess — Game {gameId}</h1>
      <p>Player: {player}</p>
      <section>
        <h2>Board (FEN)</h2>
        <pre>{fen}</pre>
      </section>

      <section>
        <h2>Visible Moves</h2>
        <ol>
          {moves.map((m: any) => (
            <li key={m.id}>{m.san} ({`${m.from_square}->${m.to_square}`})</li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Submit Move</h2>
        <form onSubmit={submitMove}>
          <input value={fromSq} onChange={(e) => setFromSq(e.target.value)} placeholder="from (e2)" />
          <input value={toSq} onChange={(e) => setToSq(e.target.value)} placeholder="to (e4)" />
          <button type="submit">Submit</button>
        </form>
      </section>
    </main>
  )
}
