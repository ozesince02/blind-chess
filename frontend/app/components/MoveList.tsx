"use client"

import React from 'react'

export type Move = {
  id: number
  ply_number: number
  san: string
  from_square: string
  to_square: string
}

export default function MoveList({ moves }: { moves: Move[] }) {
  return (
    <div className="panel moves">
      <strong style={{ display: 'block', marginBottom: 8 }}>Moves</strong>
      <ol>
        {moves.map((m) => (
          <li key={m.id}>{m.ply_number}. {m.san} ({m.from_square}→{m.to_square})</li>
        ))}
      </ol>
    </div>
  )
}


