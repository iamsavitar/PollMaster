import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import app from "./src/app.js";

const port = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO is used to notify connected clients when a poll gets a new vote.
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "*" }
});
app.set("io", io);

io.on("connection", (socket) => {
  socket.on("joinPoll", (pollId) => socket.join(pollId));
});

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Copy .env.example to .env and add your Atlas URI.");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    server.listen(port, () => console.log(`PollMaster running at http://localhost:${port}`));
  } catch (error) {
    console.error("Could not start:", error.message);
    process.exit(1);
  }
}

start();
