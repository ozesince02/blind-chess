"use client"

import React from 'react'

export type ClockProps = {
  label: string
  initialMs: number
  running: boolean
}

export default function Clock({ label, initialMs, running }: ClockProps) {
  const [ms, setMs] = React.useState(initialMs)
  const last = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!running) { last.current = null; return }
    const raf = () => {
      const now = performance.now()
      if (last.current != null) {
        const delta = now - last.current
        setMs((v) => Math.max(0, v - delta))
      }
      last.current = now
      id.current = requestAnimationFrame(raf)
    }
    const id = { current: 0 as unknown as number }
    id.current = requestAnimationFrame(raf)
    return () => cancelAnimationFrame(id.current)
  }, [running])

  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  const tenths = Math.floor((ms % 1000) / 100)

  return (
    <div className={`clock ${running ? 'active' : ''}`}>
      <div className="label">{label}</div>
      <div className="time">{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}.{tenths}</div>
    </div>
  )
}


