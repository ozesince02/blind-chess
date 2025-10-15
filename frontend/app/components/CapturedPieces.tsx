"use client"

import React from 'react'
import { Captured, getCapturedFromFen, pieceGlyph } from '../lib/chess'

export default function CapturedPieces({ fen }: { fen: string }) {
  const caps: Captured = React.useMemo(() => getCapturedFromFen(fen), [fen])
  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Captured</strong>
      </div>
      <div className="captured" style={{ marginBottom: 8 }}>
        {caps.whiteCaptured.map((p, i) => (
          <div key={`w-${p}-${i}`} className="cap">{pieceGlyph(p)}</div>
        ))}
      </div>
      <div className="captured">
        {caps.blackCaptured.map((p, i) => (
          <div key={`b-${p}-${i}`} className="cap">{pieceGlyph(p)}</div>
        ))}
      </div>
    </div>
  )
}


