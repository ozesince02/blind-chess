export type BoardCell = string | null

export function parseBoardFromFen(fen: string): BoardCell[][] {
  const rows = fen.split(' ')[0]?.split('/') || []
  const board: BoardCell[][] = []
  for (let r = 0; r < 8; r++) {
    const row = rows[r] || ''
    const out: BoardCell[] = []
    for (const ch of row) {
      if (/[1-8]/.test(ch)) {
        const n = parseInt(ch, 10)
        for (let i = 0; i < n; i++) out.push(null)
      } else {
        out.push(ch)
      }
    }
    board.push(out)
  }
  return board
}

export function getActiveColor(fen: string): 'w' | 'b' {
  const parts = fen.split(' ')
  return (parts[1] as 'w' | 'b') || 'w'
}

const initialCounts: Record<string, number> = {
  P: 8, R: 2, N: 2, B: 2, Q: 1, K: 1,
  p: 8, r: 2, n: 2, b: 2, q: 1, k: 1,
}

export type Captured = { whiteCaptured: string[]; blackCaptured: string[] }

export function getCapturedFromFen(fen: string): Captured {
  const board = parseBoardFromFen(fen)
  const counts: Record<string, number> = { P: 0, R: 0, N: 0, B: 0, Q: 0, K: 0, p: 0, r: 0, n: 0, b: 0, q: 0, k: 0 }
  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue
      if (counts[cell] !== undefined) counts[cell]++
    }
  }
  const whiteCaptured: string[] = [] // captured black pieces
  const blackCaptured: string[] = [] // captured white pieces
  const order = ['q','r','b','n','p'] as const
  for (const t of order) {
    const needBlack = (initialCounts[t] || 0) - (counts[t] || 0)
    for (let i = 0; i < needBlack; i++) whiteCaptured.push(t)
    const T = t.toUpperCase()
    const needWhite = (initialCounts[T] || 0) - (counts[T] || 0)
    for (let i = 0; i < needWhite; i++) blackCaptured.push(T)
  }
  return { whiteCaptured, blackCaptured }
}

export function squareNameAt(row: number, col: number): string {
  // row 0 => rank 8, col 0 => file 'a'
  const file = String.fromCharCode('a'.charCodeAt(0) + col)
  const rank = 8 - row
  return `${file}${rank}`
}

export function pieceGlyph(piece: string): string {
  switch (piece) {
    case 'K': return '♔'
    case 'Q': return '♕'
    case 'R': return '♖'
    case 'B': return '♗'
    case 'N': return '♘'
    case 'P': return '♙'
    case 'k': return '♚'
    case 'q': return '♛'
    case 'r': return '♜'
    case 'b': return '♝'
    case 'n': return '♞'
    case 'p': return '♟'
    default: return ''
  }
}


