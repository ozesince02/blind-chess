import socketio

# Async Server with Redis message queue support placeholder
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = socketio.ASGIApp(sio)


@sio.event
async def connect(sid, environ):
    print('connect', sid)


@sio.event
async def disconnect(sid):
    print('disconnect', sid)


@sio.event
async def join_game(sid, data):
    # data: {"game_id": <int>, "player": "alice"}
    room = f"game_{data['game_id']}"
    await sio.save_session(sid, data)
    await sio.enter_room(sid, room)
    await sio.emit('presence', {'sid': sid, 'player': data.get('player')}, room=room)
