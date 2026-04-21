import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import messageModel from './model/messageModel.js';
import connectDb from './model/connectDb.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true
  }
});

// ✅ FIX 1: better error return
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (token === 'pankaj' || token === 'deepak') {
      socket.senderId = token;
      return next();
    }

    return next(new Error("Invalid token")); // ✅ changed

  } catch (err) {
    return next(new Error("Authentication failed")); // ✅ changed
  }
});

io.on("connection", (socket) => {

  console.log("socket connected", socket.id);

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });

  socket.on("join_group", async (data) => {
    const groupId = data.groupId;

    socket.join(groupId);
    console.log("joined group:", groupId);

    try {
      // ✅ FIX 2: sorted messages
      const result = await messageModel
        .find({ groupId: groupId })
        .sort({ createdAt: 1 });   // ✅ added

      socket.emit("get_message", result);

    } catch (error) {
      socket.emit("error_message", error.message);
    }
  });

  socket.on("private_message", async (data) => {
    try {

      if(!socket.senderId)
      {
         socket.emit("error_message","Unauthorized user ❌" );
      }

      const result = await messageModel.create({
        userId: socket.senderId,
        groupId: data.groupId,
        message: data.message
      });

      if (!result) {
        throw new Error("Error while inserting data in db");
      }

      const groupId = data.groupId;

      // ✅ FIX 3: send to ALL (including sender)
      io.to(groupId).emit("receive_message", result);  // ✅ changed

    } catch (error) {
      socket.emit("error_message", error.message);
    }
  });

});

connectDb().then(() => {
  server.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
  });
});