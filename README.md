# YouTube Watch Party

A full-stack watch party app for synchronized YouTube playback. Users create or join rooms with a unique code, then play, pause, seek, and change videos together in real time with role-based permissions enforced on the server.

## Features

- **Create / Join Room** — 8-character room codes, display names, session persistence
- **Synchronized Playback** — play, pause, seek, and video changes stay in sync via Socket.IO
- **YouTube IFrame API** — embedded player with late-join state recovery
- **Roles** — Host, Moderator, and Participant with server-side permission checks
- **Participant Management** — live list, role assignment, host transfer, remove participant
- **Production Ready** — Docker, Render, and Vercel configs included

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB, Mongoose |

## Architecture

```
┌─────────────┐     REST API      ┌─────────────┐
│   React     │◄─────────────────►│   Express   │
│   Client    │                   │   Server    │
│             │     WebSocket     │             │
│  YouTube    │◄─────────────────►│  Socket.IO  │
│  IFrame API │                   │             │
└─────────────┘                   └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │   MongoDB   │
                                └─────────────┘
```

REST handles room creation and joining. Socket.IO handles playback sync and participant updates. Playback state lives in MongoDB; elapsed time is computed for late joiners.

## Folder Structure

```
Youtube_Watch_Application/
├── client/
│   └── src/
│       ├── components/
│       │   ├── layout/       # App shell
│       │   ├── room/         # Room UI, player, participants
│       │   └── ui/           # Shared UI primitives
│       ├── constants/        # Role definitions and permission helpers
│       ├── context/          # Socket.IO provider
│       ├── hooks/            # YouTube player hook
│       ├── pages/            # Route pages
│       ├── services/         # REST API client
│       └── utils/            # Helpers
├── server/
│   └── src/
│       ├── config/           # Database connection
│       ├── constants/        # Server-side roles
│       ├── controllers/      # REST handlers
│       ├── middleware/       # Error handling
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express routes
│       ├── socket/handlers/  # Socket event handlers
│       └── validators/       # Request validation
├── docker-compose.yml        # Local MongoDB
├── Dockerfile                # Full-stack production image
├── render.yaml               # Render deployment
└── client/vercel.json        # Vercel SPA routing
```

## Role Permissions

| Action | Host | Moderator | Participant |
|--------|:----:|:---------:|:-----------:|
| Play / Pause / Seek | Yes | Yes | No |
| Change Video | Yes | Yes | No |
| Assign Role | Yes | No | No |
| Remove Participant | Yes | No | No |
| Transfer Host | Yes | No | No |
| View Participants | Yes | Yes | Yes |

Participants cannot perform restricted actions even by emitting socket events directly — the server rejects unauthorized requests.

## Environment Variables

**Server** (`server/.env`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/youtube-watch-party
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client** (`client/.env`):

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

For production, set `CLIENT_URL` to your deployed frontend URL(s). Comma-separate multiple origins if needed.

## Installation

```bash
git clone <repo-url>
cd Youtube_Watch_Application
npm run install:all
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Running Locally

Start MongoDB (Docker):

```bash
docker-compose up -d
```

Run both client and server:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api/health

The Vite dev server proxies `/api` and `/socket.io` to the backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/rooms` | Create a room |
| GET | `/api/rooms/:roomId` | Get room info |
| POST | `/api/rooms/:roomId/join` | Join a room |

## Socket Events

### Client → Server

| Event | Payload | Permission |
|-------|---------|------------|
| `join_room` | `{ roomId, odId }` | Registered participant |
| `leave_room` | — | Any connected user |
| `play` | `{ currentTime }` | Host, Moderator |
| `pause` | `{ currentTime }` | Host, Moderator |
| `seek` | `{ currentTime }` | Host, Moderator |
| `change_video` | `{ videoId }` | Host, Moderator |
| `assign_role` | `{ targetOdId, role }` | Host |
| `remove_participant` | `{ targetOdId }` | Host |
| `transfer_host` | `{ targetOdId }` | Host |

All client events support an acknowledgement callback: `(response) => void`.

### Server → Client

| Event | Description |
|-------|-------------|
| `sync_state` | Playback sync (play, pause, seek, change_video, initial state) |
| `user_joined` | A participant connected to the room |
| `user_left` | A participant disconnected or left |
| `role_assigned` | A participant's role changed |
| `participant_removed` | A participant was removed by the host |

## Production Build

```bash
npm run build
npm run start:prod
```

Express serves the built React app from `client/dist` when `NODE_ENV=production`.

## Live Demo

> **Deployment URL:** _Deploy using the instructions below, then add your public URL here (e.g. `https://your-app.onrender.com`)._

## Deployment

### Render (full stack)

1. Push to GitHub
2. Create a Web Service on [Render](https://render.com)
3. Use `render.yaml` or set:
   - **Build:** `npm run install:all && npm run build`
   - **Start:** `npm run start:prod`
4. Set `MONGODB_URI` and `CLIENT_URL`

### Docker

```bash
docker build -t youtube-watch-party .
docker run -p 5000:5000 \
  -e MONGODB_URI=your_uri \
  -e CLIENT_URL=https://your-domain.com \
  youtube-watch-party
```

### Vercel (frontend only)

Deploy the `client/` directory. Set environment variables:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

Point `CLIENT_URL` on the backend to your Vercel URL.

## License

MIT
