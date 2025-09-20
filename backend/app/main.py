from fastapi import FastAPI
from .routers import games
from .socketio_server import app as socketio_app
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.applications import Starlette
from starlette.routing import Mount


fastapi_app = FastAPI(title="Blind Chess Backend")
fastapi_app.include_router(games.router, prefix="/games", tags=["games"])


@fastapi_app.get("/healthz")
async def healthz():
    return {"status": "ok"}


# Compose Starlette app that mounts the Socket.IO ASGI app at /ws
app = Starlette(routes=[Mount('/', app=fastapi_app), Mount('/ws', app=socketio_app)])

