"use client"

import React from 'react'
import ChessBoard from '../../components/ChessBoard'
import Clock from '../../components/Clock'
import CapturedPieces from '../../components/CapturedPieces'
import MoveList from '../../components/MoveList'
import { getSocket } from '../../lib/socket'

type SearchParams = { player?: string }

export default function RoomPage({ params, searchParams }: { params: { gameId: string }, searchParams: SearchParams }) {
  const gameId = params.gameId
  const player = searchParams.player || 'alice'

  const [fen, setFen] = React.useState('')
  const [moves, setMoves] = React.useState<any[]>([])
  const [lastFrom, setLastFrom] = React.useState<string | undefined>(undefined)
  const [lastTo, setLastTo] = React.useState<string | undefined>(undefined)

  const [whiteMs, setWhiteMs] = React.useState(5 * 60 * 1000)
  const [blackMs, setBlackMs] = React.useState(5 * 60 * 1000)

  const [active, setActive] = React.useState<'w' | 'b'>('w')

  React.useEffect(() => {
    const socket = getSocket()
    const onConnect = () => {
      socket.emit('join_game', { game_id: Number(gameId), player })
    }
    socket.on('connect', onConnect)
    socket.on('move_submitted', handleSocketEvent)
    socket.on('moves_revealed', handleSocketEvent)
    fetchBoard()
    return () => {
      socket.off('connect', onConnect)
      socket.off('move_submitted', handleSocketEvent)
      socket.off('moves_revealed', handleSocketEvent)
    }
  }, [gameId, player])

  async function fetchBoard() {
    const res = await fetch(`http://localhost:8000/games/${gameId}/board-view?player=${player}`)
    const j = await res.json()
    setFen(j.fen)
    setMoves(j.moves || [])
    if (j.moves && j.moves.length) {
      const last = j.moves[j.moves.length - 1]
      setLastFrom(last.from_square)
      setLastTo(last.to_square)
      // Toggle active for demo; real active side should come from FEN move side
      setActive(prev => (prev === 'w' ? 'b' : 'w'))
    }
  }

  function handleSocketEvent() {
    fetchBoard()
  }

  async function onCommitMove(from: string, to: string) {
    const res = await fetch(`http://localhost:8000/games/${gameId}/moves?player=${player}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from_square: from, to_square: to })
    })
    if (res.ok) {
      setLastFrom(from)
      setLastTo(to)
      fetchBoard()
    } else {
      const err = await res.json().catch(() => ({}))
      alert('Move failed: ' + (err.detail || res.statusText))
    }
  }

  return (
    <div className="room">
      <div className="topbar">
        <div><strong>Game #{gameId}</strong></div>
        <div style={{ color: '#a1a1aa' }}>Player: {player}</div>
      </div>

      <div className="grid">
        <div className="panel">
          <div className="clocks" style={{ marginBottom: 12 }}>
            <Clock label="White" initialMs={whiteMs} running={active === 'w'} />
            <Clock label="Black" initialMs={blackMs} running={active === 'b'} />
          </div>
          <CapturedPieces fen={fen} />
        </div>

        <ChessBoard fen={fen} lastFrom={lastFrom} lastTo={lastTo} onCommitMove={onCommitMove} />

        <div className="panel">
          <MoveList moves={moves} />
          <div style={{ height: 12 }} />
          <div className="move-input">
            <button onClick={() => fetchBoard()}>Refresh</button>
          </div>
        </div>
      </div>
    </div>
  )
}


