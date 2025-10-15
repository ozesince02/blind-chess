"use client"
import React from 'react'

export default function Home() {
  const [white, setWhite] = React.useState('alice')
  const [black, setBlack] = React.useState('bob')
  const [gameId, setGameId] = React.useState<number | null>(null)
  const [copyMsg, setCopyMsg] = React.useState('')
  const [errMsg, setErrMsg] = React.useState('')

  const [joinGameId, setJoinGameId] = React.useState('')
  const [joinPlayer, setJoinPlayer] = React.useState('')

  async function createGame(e: React.FormEvent) {
    e.preventDefault()
    setErrMsg('')
    try {
      const res = await fetch('http://localhost:8000/games/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ white_player: white, black_player: black })
      })
      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        setErrMsg(msg || `Failed to create game (${res.status})`)
        return
      }
      const j = await res.json()
      setGameId(j.id)
    } catch (e: any) {
      setErrMsg(e?.message || 'Network error')
    }
  }

  function inviteUrl(id: number, player: string) {
    if (typeof window === 'undefined') return ''
    const base = window.location.origin
    return `${base}/room/${id}?player=${encodeURIComponent(player)}`
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 1200)
    } catch {
      setCopyMsg('Copy failed')
      setTimeout(() => setCopyMsg(''), 1200)
    }
  }

  function goJoin() {
    if (!joinGameId || !joinPlayer) return
    window.location.href = `/room/${encodeURIComponent(joinGameId)}?player=${encodeURIComponent(joinPlayer)}`
  }

  return (
    <main className="room">
      <div className="topbar">
        <div><strong>Blind Chess</strong></div>
        <div style={{ color: '#a1a1aa' }}>Create a room and share the link</div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Create Game</h2>
          <form onSubmit={createGame} style={{ display: 'grid', gap: 8 }}>
            <input value={white} onChange={e => setWhite(e.target.value)} placeholder="White player name" />
            <input value={black} onChange={e => setBlack(e.target.value)} placeholder="Black player name" />
            <button type="submit">Create</button>
          </form>
          {errMsg ? <div style={{ marginTop: 8, color: '#ef4444' }}>{errMsg}</div> : null}

          {gameId && (
            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8, color: '#a1a1aa' }}>Invite Links</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <InviteRow label="White" url={inviteUrl(gameId, white)} onCopy={copy} />
                <InviteRow label="Black" url={inviteUrl(gameId, black)} onCopy={copy} />
              </div>
              <div style={{ height: 8 }} />
              <a href={`/room/${gameId}?player=${encodeURIComponent(white)}`}><button>Enter as White</button></a>
              <span style={{ marginLeft: 8 }} />
              <a href={`/room/${gameId}?player=${encodeURIComponent(black)}`}><button>Enter as Black</button></a>
              {copyMsg ? <div style={{ marginTop: 8, color: '#a1a1aa' }}>{copyMsg}</div> : null}
            </div>
          )}
        </div>

        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Quick Join</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            <input value={joinGameId} onChange={e => setJoinGameId(e.target.value)} placeholder="Game ID" />
            <input value={joinPlayer} onChange={e => setJoinPlayer(e.target.value)} placeholder="Your name" />
            <button onClick={goJoin}>Join</button>
          </div>
        </div>
      </div>
    </main>
  )
}

function InviteRow({ label, url, onCopy }: { label: string; url: string; onCopy: (t: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 8, alignItems: 'center' }}>
      <div style={{ color: '#a1a1aa' }}>{label}</div>
      <input value={url} readOnly />
      <button type="button" onClick={() => onCopy(url)}>Copy</button>
    </div>
  )
}
