import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import messageModel from "./model/messageModel.js";
import connectDb from "./model/connectDb.js";

const app = express();

const userOnline = new Map();

app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (token === "pankaj" || token === "deepak" || token==='madhav') {
    socket.senderId = token;
    return next();
  }

  return next(new Error("Invalid token"));
});

io.on("connection", (socket) => {
 const userId = socket.senderId;

  userOnline.set(userId, socket.id);

  //user open whstapp so it means online for eveyone
  console.log("connected:", socket.id, userId);
  console.log(userOnline.size);
    io.to("messages").emit("online_count", userOnline.size);

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id, userId);
    userOnline.delete(userId);
     io.to("messages").emit("online_count", userOnline.size);
     
  });

  socket.on("join_group", async (data) => {
    const { groupId } = data;

    socket.join(groupId);
       io.to(groupId).emit("online_count", userOnline.size);

    const messages = await messageModel
      .find({ groupId })
      .sort({ createdAt: 1 });

    socket.emit("get_message", messages);
  });

  socket.on("typing_message", (data) => {
    socket.to(data.groupId).emit("typing_message", {
      userId: data.userId,
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.groupId).emit("stop_typing", {
      userId: data.userId,
    });
  });

  socket.on("private_message", async (data) => {
    try {
      const msg = await messageModel.create({
        userId,
        groupId: data.groupId,
        message: data.message,
      });

      io.to(data.groupId).emit("receive_message", msg);
    } catch (err) {
      socket.emit("error_message", err.message);
    }
  });
});

connectDb().then(() => {
  server.listen(5000, () => {
    console.log("server running on port 5000");
  });
});