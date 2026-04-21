💬 Real-Time Group Chat App (Socket.IO + MongoDB + React)

A real-time group chat application built using Socket.IO, Express, MongoDB, and React with authentication via socket middleware.

🚀 Features
🔐 Socket authentication using middleware (token-based)
💬 Real-time group chat
📦 MongoDB message storage
🧑‍🤝‍🧑 Multiple group support
⚡ Instant message broadcasting
📜 Chat history loading on join
❌ Unauthorized user blocking
🎯 Smooth auto-scroll chat UI
🎨 Dark modern UI (React)

🏗️ Tech Stack
Backend
Node.js
Express.js
Socket.IO
MongoDB + Mongoose
CORS
Frontend
React.js
Socket.IO Client
JavaScript (ES6+)

📁 Project Structure
/backend
   ├── model/
   │     ├── messageModel.js
   │     └── connectDb.js
   ├── server.js

/frontend
   ├── App.js
   ├── styles (inline)


⚙️ Installation & Setup
1️⃣ Clone repository
git clone https://github.com/your-username/group-chat-app.git
cd group-chat-app

2️⃣ Backend setup
cd backend
npm install
Start server
node server.js

3️⃣ Frontend setup
cd frontend
npm install
npm start

🔌 Socket Events
| Event             | Description           |
| ----------------- | --------------------- |
| `join_group`      | Join a chat room      |
| `private_message` | Send message to group |

📤 Server → Client
| Event             | Description               |
| ----------------- | ------------------------- |
| `receive_message` | Broadcast new message     |
| `get_message`     | Load previous messages    |
| `error_message`   | Custom server error       |
| `connect_error`   | Auth failure (middleware) |

🔐 Authentication Flow (Socket Middleware)

Backend validates token:

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (token === "pankaj" || token === "deepak") {
    socket.senderId = token;
    return next();
  }

  return next(new Error("Invalid token"));
});

👉 If token is invalid:
Connection is rejected
Frontend receives connect_error

💬 Message Flow
User joins group → join_group
Server sends chat history → get_message
User sends message → private_message
Server saves in MongoDB
Server broadcasts → receive_message


🗄️ Database Schema
{
  userId: String,
  groupId: String,
  message: String,
  timestamps: true
}

⚠️ Error Handling
Middleware errors (auth)
socket.on("connect_error", (err) => {
  console.log(err.message);
});
Runtime errors
socket.on("error_message", (err) => {
  setError(err);
});

🎨 UI Features
Dark modern chat UI
Left/right message alignment
Auto scroll to latest messagegit add .
Online status indicator
Smooth message rendering

📌 Important Concepts Used
Socket.IO middleware authentication
Room-based messaging (socket.join)
Event-driven architecture
MongoDB message persistence
React state + socket integration
Connection lifecycle management

🚀 Future Improvements
🔐 JWT authentication (replace static tokens)
👤 User login/signup system
🟢 Online/offline status
✍️ Typing indicator
📩 Private 1-to-1 chat
📱 Mobile responsive UI
🔔 Notifications