const path = require('path');
const http = require('http');

require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocation } = require('./utils/message');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
  console.log('New WebSocket Connection.');

  socket.on('join', (options, cb) => {
    const { user, error } = addUser({ ...options, id: socket.id });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage(user.room, 'Welcome bitches!!'));

    socket.broadcast
      .to(user.room)
      .emit(
        'chatChange',
        generateMessage(user.room, `${user.username} has joined the chat!`)
      );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    cb();
  });

  socket.on('sendMsg', (text, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(text)) {
      return callback('BAZINGA!! LOL');
    }

    if (user) {
      io.to(user.room).emit('chatChange', generateMessage(user.username, text));
      callback();
    }
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      'sendLocation',
      generateLocation(
        user.username,
        `https://google.com/maps?q=${coords.lat},${coords.long}`
      )
    );
    callback('Location shared!');
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'chatChange',
        generateMessage(`${user.username} has left the room.`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

const port = process.env.PORT;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`Server is up and running on port ${port}...`);
});
