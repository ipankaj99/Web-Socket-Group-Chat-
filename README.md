# 💬 Real-Time Group Chat App

A real-time group chat application built with **Socket.IO**, **Express**, **MongoDB**, and **React** — featuring token-based socket authentication, multi-group support, and persistent message history.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

---

## 🚀 Features

- 🔐 **Socket authentication** via middleware (token-based)
- 💬 **Real-time group messaging** with instant broadcasting
- 📦 **MongoDB message persistence** — chat history survives refreshes
- 🧑‍🤝‍🧑 **Multiple group support** — join different chat rooms
- 📜 **Chat history on join** — previous messages load automatically
- ❌ **Unauthorized user blocking** — invalid tokens are rejected at connection
- 🎯 **Auto-scroll** to the latest message
- 🎨 **Dark modern UI** built with React

---

## 🏗️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Node.js, Express.js, Socket.IO, MongoDB, Mongoose, CORS |
| **Frontend** | React.js, Socket.IO Client, JavaScript (ES6+) |

---

## 📁 Project Structure

```
group-chat-app/
│
├── backend/
│   ├── model/
│   │   ├── messageModel.js       # Mongoose schema for messages
│   │   └── connectDb.js          # MongoDB connection setup
│   └── server.js                 # Express + Socket.IO server
│
└── frontend/
    └── App.js                    # React UI with socket integration
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/group-chat-app.git
cd group-chat-app
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
node server.js
```

> The server starts on `http://localhost:5000` by default.

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

> The React app runs on `http://localhost:3000`.

---

## 🗄️ Database Schema

```js
// messageModel.js
{
  userId:    String,      // Token/username of the sender
  groupId:   String,      // Chat room identifier
  message:   String,      // Message content
  timestamps: true        // createdAt & updatedAt added automatically
}
```

---

## 🔐 Authentication Flow

Socket connections are validated via middleware before any event is processed.

```js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (token === "pankaj" || token === "deepak") {
    socket.senderId = token;
    return next();
  }

  return next(new Error("Invalid token"));
});
```

| Scenario | Outcome |
|----------|---------|
| Valid token | Connection established, `socket.senderId` set |
| Invalid token | Connection rejected, `connect_error` emitted to client |

---

## 🔌 Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_group` | `{ groupId }` | Join a chat room and load history |
| `private_message` | `{ groupId, message }` | Send a message to the group |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `{ userId, message, groupId }` | New message broadcast to the room |
| `get_message` | `[...messages]` | Chat history on joining a group |
| `error_message` | `{ message }` | Runtime error notification |
| `connect_error` | Error object | Authentication failure |

---

## 💬 Message Flow

```
User joins group
      │
      ▼
  join_group  ──►  socket.join(groupId)
                        │
                        ▼
                  Fetch history from MongoDB
                        │
                        ▼
               emit get_message → client

User sends message
      │
      ▼
  private_message  ──►  Save to MongoDB
                              │
                              ▼
                    Broadcast receive_message
                      to all in room
```

---

## ⚠️ Error Handling

**Authentication errors (middleware):**
```js
socket.on("connect_error", (err) => {
  console.log(err.message); // "Invalid token"
});
```

**Runtime errors:**
```js
socket.on("error_message", (err) => {
  setError(err);
});
```

---

## 🎨 UI Features

- Dark modern chat interface
- Left/right message alignment (sent vs. received)
- Auto-scroll to the latest message
- Online status indicator
- Smooth message rendering

---

## 🚀 Future Improvements

- [ ] 🔐 JWT authentication (replace static tokens)
- [ ] 👤 User login/signup system
- [ ] 🟢 Online/offline presence indicators
- [ ] ✍️ Typing indicator
- [ ] 📩 Private 1-to-1 chat
- [ ] 📱 Mobile responsive UI
- [ ] 🔔 Push notifications

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

> Built with ❤️ using Node.js, React, and Socket.IO
