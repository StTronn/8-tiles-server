import _ from "lodash";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Room from "./room";
import socketio from "socket.io";
import http from "http";

dotenv.config();

let app = express();
app.use(cors());
let server = http.createServer(app);
let io = socketio(server, {
  cors: {
    origin: true,
  },
});
app.use(cors());

let rooms = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, roomId }) => {
    let room = rooms[roomId] ? rooms[roomId] : new Room(roomId);
    rooms[roomId] = room;
    room.addUser({ username, id: socket.id });
    socket.join(roomId);

    console.log("joinRoom", roomId);
    room.updateUser(socket, io, socket.id, {});
  });

  socket.on("updateUser", ({ id, roomId, payload }) => {
    if (rooms[roomId]) rooms[roomId].updateUser(socket, io, id, payload);
  });

  socket.on("disconnecting", () => {
    const roomId = [...socket.rooms][1];
    if (socket.id && roomId) {
      rooms[roomId].deleteUser(socket.id);
      if (_.isEmpty(rooms[roomId].users, true)) rooms = _.omit(rooms, roomId);
      console.log("leaving room");
    }
  });
});

app.get("/", (req, res) => res.send("server running"));

server.listen("8000", () => {
  console.log("Listening to port 8000");
});
