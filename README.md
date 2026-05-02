# LumoChat — Backend

The Node.js/TypeScript API server for LumoChat. Handles authentication, connections, messaging, and real-time events via Socket.io.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Language | TypeScript (compiled with `tsc`, dev via `tsx`) |
| Framework | Express 5 |
| Real-time | Socket.io |
| Database | PostgreSQL (via `pg` Pool) |
| Auth | JWT (cookie + localStorage) |
| File uploads | Multer (local staging) → Cloudinary |
| Image processing | Sharp (compression before upload) |
| Password hashing | bcryptjs |
| Logging | Morgan |

## Project Structure

```
src/
├── index.ts              # Entry point — registers routes, starts HTTP server
├── app.ts                # Express app, Socket.io setup, online-user tracking
├── configs/
│   └── db.config.ts      # PostgreSQL Pool (reads DATABASE_URL)
├── controllers/          # Request handlers (thin — delegate to services)
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── connection.controller.ts
│   └── message.controller.ts
├── routes/               # Express routers
│   ├── auth.route.ts
│   ├── user.route.ts
│   ├── connection.route.ts
│   └── message.route.ts
├── services/             # Database queries and business logic
│   ├── auth.service.ts         # JWT generation, bcrypt helpers
│   ├── user.service.ts         # User DB queries
│   ├── connection.service.ts   # Connection/friend-request queries
│   ├── message.service.ts      # Message DB queries
│   └── imageUpload.service.ts  # Sharp compression + Cloudinary upload
├── middlewares/
│   ├── auth.middleware.ts       # checkLogin — verifies JWT from cookie
│   ├── multer.middleware.ts     # Configures local disk storage for uploads
│   └── socket.middleware.ts    # JWT auth for Socket.io connections
├── types/
│   ├── user.type.ts             # User interface
│   └── express.d.ts            # Augments Express Request with req.user
└── utils/
    ├── asyncHandler.ts          # Wraps async controllers to forward errors
    └── responses.ts             # ApiResponse / ApiError helpers
```

## API Reference

All authenticated routes require a valid `token` cookie (set at login).

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register with email + password |
| POST | `/signin` | No | Login with email + password |
| GET | `/signout` | No | Clear auth cookie |

### User — `/api/user`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Yes | Get the logged-in user's profile |
| PUT | `/` | Yes | Update name / profile picture |

### Connections — `/api/connection`

A *connection* is a two-way relationship (like a contact/friend). It begins as a pending request.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | List all accepted connections |
| POST | `/` | Yes | Send a connection request (body: `{ email }`) |
| GET | `/requests` | Yes | List incoming pending requests |
| GET | `/responses` | Yes | List outgoing pending requests |
| GET | `/accept-request/:id` | Yes | Accept a pending connection |
| GET | `/reject-request/:id` | Yes | Reject a pending connection |

### Messages — `/api/message`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Send a message (`multipart/form-data`: `connectionId`, `receiverId`, `text`, optional `file`) |
| GET | `/:id` | Yes | Fetch messages for connection `id` (query: `offset`, `limit`) |
| GET | `/:id/media` | Yes | Fetch all media attachments for connection `id` |

## How It Was Built

### Authentication Flow
Register and login endpoints hash passwords with `bcryptjs` (salt rounds: 10) and issue a JWT signed with `JWT_SECRET`. The token is sent as both an HTTP-only cookie (for REST API requests) and in the response body (for the client to store in `localStorage` for socket auth). Every protected route runs `checkLogin` middleware which reads the cookie, verifies the JWT, and attaches the decoded user to `req.user`.

### Database
PostgreSQL is accessed directly with the `pg` Pool — no ORM. All queries live in the `services/` layer. The pool is initialised from `DATABASE_URL` in `.env`.

### Real-time with Socket.io
`app.ts` creates an HTTP server wrapping the Express app and attaches Socket.io to it. The socket middleware verifies the JWT from the handshake auth cookie before accepting a connection.

A `userSocketMap` (`Record<userId, socketId>`) is kept in memory. When a message is sent via HTTP, the message controller looks up the receiver's socket ID and emits `newMessage` directly to that socket — so only the intended recipient receives it.

Typing indicators (`typing` / `stop_typing`) are also proxied through this map: the sender emits to their socket, the server forwards the event to the receiver's socket.

Online status is broadcast to all clients via `getOnlineUsers` whenever a user connects or disconnects.

### File Uploads
Multer stages the uploaded file to the local `uploads/` directory. For images, `sharp` compresses to JPEG at 30% quality before the file is read from disk and uploaded to Cloudinary. Audio and video files are uploaded as-is. The local file is not cleaned up after upload (Cloudinary returns a permanent URL).

### Error Handling
`asyncHandler` wraps every controller in a try/catch and forwards errors to Express's default error handler. `ApiResponse` and `ApiError` are thin helpers that write a consistent JSON envelope: `{ success, message, data? }`.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account (for media uploads)

### Install & run

```bash
npm install
npm run dev        # starts with tsx --watch on port 9090
```

### Environment variables

Create a `.env` file in this directory:

```env
PORT=9090
DATABASE_URL=postgresql://user:password@localhost:5432/lumochat
JWT_SECRET=your_jwt_secret

# Cloudinary (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend origin for CORS
CLIENT_URL=http://localhost:3000
```

### Other scripts

```bash
npm run build    # tsc → dist/
npm start        # node dist/index.js (production)
```

## Key Dependencies

```
express             # HTTP framework
socket.io           # WebSocket server
pg                  # PostgreSQL client
jsonwebtoken        # JWT sign/verify
bcryptjs            # Password hashing
cloudinary          # Cloud media storage
multer              # Multipart file upload
sharp               # Image compression
morgan              # HTTP request logging
cookie-parser       # Cookie parsing middleware
dotenv              # Environment variable loading
```
