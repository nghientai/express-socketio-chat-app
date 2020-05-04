const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMsg = require("./public/js/message");
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require("./public/js/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "Bot chat";

//Run when client connect
io.on("connection", (socket) => {
   //console.log("sw connected");
   socket.on("joinRoom", ({ fullName, chatRoom }) => {
      const user = userJoin(socket.id, fullName, chatRoom);

      // Join a user to a room
      socket.join(user.room);

      // Emit hello message from the server
      socket.emit("message", formatMsg(botName, "Welcome to the chat room!"));

      // Broadcast when a user connect (except the user which is connecting)
      socket.broadcast.to(user.room).emit("message", formatMsg(botName, `${user.username} has joined the chat`));

      //send user and room info
      io.to(user.room).emit("roomUsers", {
         room: user.room,
         users: getRoomUsers(user.room),
      });
   });

   socket.on("message", (msg) => {
      const user = getCurrentUser(socket.id);
      //console.log("Message " + msg);
      io.to(user.room).emit("message", formatMsg(user.username, msg));
   });

   // Runs when client disconnects
   socket.on("disconnect", () => {
      const user = userLeave(socket.id);

      if (user) {
         io.to(user.room).emit("message", formatMsg(botName, `${user.username} has left the chat.`));
         //send user and room info
         io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
         });
      }
      // console.log("A user has left the chat.");
   });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
   console.log("Listening on port " + PORT);
});
