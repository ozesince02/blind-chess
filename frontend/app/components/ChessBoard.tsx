"use client"

import React from 'react'
import { parseBoardFromFen, pieceGlyph, squareNameAt } from '../lib/chess'

export type ChessBoardProps = {
  fen: string
  lastFrom?: string
  lastTo?: string
  onCommitMove: (from: string, to: string) => void
}

export default function ChessBoard({ fen, lastFrom, lastTo, onCommitMove }: ChessBoardProps) {
  const [selected, setSelected] = React.useState<string | null>(null)
  const board = React.useMemo(() => parseBoardFromFen(fen), [fen])

  function onSquareClick(row: number, col: number) {
    const sq = squareNameAt(row, col)
    if (!selected) {
      setSelected(sq)
      return
    }
    if (selected === sq) {
      setSelected(null)
      return
    }
    onCommitMove(selected, sq)
    setSelected(null)
  }

  function isLast(row: number, col: number): boolean {
    const sq = squareNameAt(row, col)
    return (!!lastFrom && sq === lastFrom) || (!!lastTo && sq === lastTo)
  }

  return (
    <div className="board">
      <div className="board-grid">
        {board.map((row, rIdx) => (
          row.map((cell, cIdx) => {
            const isDark = (rIdx + cIdx) % 2 === 1
            const sq = squareNameAt(rIdx, cIdx)
            const sel = selected === sq
            const last = isLast(rIdx, cIdx)
            const cls = `sq ${isDark ? 'dark' : 'light'}${sel ? ' selected' : ''}${last ? ' last' : ''}`
            const glyph = cell ? pieceGlyph(cell) : ''
            const isBlackPiece = cell ? cell.toLowerCase() === cell : false
            return (
              <div key={`${rIdx}-${cIdx}`} className={cls} onClick={() => onSquareClick(rIdx, cIdx)}>
                {glyph ? <span className={`piece ${isBlackPiece ? 'black' : ''}`}>{glyph}</span> : null}
              </div>
            )
          })
        ))}
      </div>
    </div>
  )
}


