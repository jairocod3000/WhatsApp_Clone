const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

app.use(express.static('public'));

const rooms = {
  "1": { users: [], connectedCount: 0 },
  "2": { users: [], connectedCount: 0 },
  "3": { users: [], connectedCount: 0 }
};

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const room = rooms[socket.room];
    room.connectedCount--;

    const userIndex = room.users.findIndex(user => user.username === socket.username);
    if (userIndex !== -1) {
      const disconnectedUser = room.users.splice(userIndex, 1)[0];
      io.to(socket.room).emit('userHasDisconnected', disconnectedUser.username);
      io.to(socket.room).emit('usersConnected', room.users);
      io.to(socket.room).emit('numUsersConnected', room.connectedCount);
    }
  });

  socket.on('setUsername', (userData) => {
    socket.username = userData.username;
    socket.room = userData.room;

    socket.join(userData.room);

    const room = rooms[userData.room];
    room.connectedCount++;
    const newUser = { userID: socket.id, username: socket.username, userImg: userData.userImg };
    room.users.push(newUser);

    io.to(socket.room).emit('userHasConnected', socket.username);
    io.to(socket.room).emit('usersConnected', room.users);
    io.to(socket.room).emit('numUsersConnected', room.connectedCount);
  });

  socket.on('message', (msg) => {
    const datosMsg = { username: socket.username, clientID: socket.clientID, serverID: socket.id, msg: msg.msg, time: msg.time };
    io.to(socket.room).emit('message', datosMsg);
  });

  socket.on("userTyping", (data) => {
    io.emit('userTyping', { userID: socket.id, isTyping: data.isTyping });
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
