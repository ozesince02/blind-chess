"use client"

import { io, Socket } from 'socket.io-client'

let cachedSocket: Socket | null = null

function computeSocketUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:8000/ws'
  const origin = window.location.origin
  return origin.replace(/:3000$/, ':8000') + '/ws'
}

export function getSocket(): Socket {
  if (cachedSocket && cachedSocket.connected) return cachedSocket
  const url = computeSocketUrl()
  cachedSocket = io(url, { transports: ['websocket'] })
  return cachedSocket
}


