# Blind Chess — Server-authoritative hidden-move chess

This repository contains a starter skeleton for a multiplayer chess game where moves are server-authoritative and "hidden" to the opponent until they submit their next move.

Tech stack:
- Frontend: Next.js (TypeScript, App Router)
- Backend: FastAPI (Python 3.11+)
- Real-time: python-socketio (Socket.IO)
- DB: PostgreSQL
- Cache/pubsub: Redis
- Chess logic: python-chess

This skeleton includes Docker + docker-compose for local development and a GitHub Actions CI workflow skeleton.

Next steps: implement backend game logic, socket events, and frontend UX.
