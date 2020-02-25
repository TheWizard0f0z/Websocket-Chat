const express = require('express');
const path = require('path');
const app = express();
const socket = require('socket.io');

const messages = [];
const users = [];

app.use(express.static(path.join(__dirname + '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/index.html'));
});

const server = app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);

io.on('connection', socket => {
  console.log('New client! Its id – ' + socket.id);

  socket.on('join', user => {
    console.log("Oh, I've got a new user logged in - " + user);

    const newUser = { name: user, id: socket.id };
    users.push(newUser);

    const message = {
      author: 'Chat Bot',
      content: `<i><b>${user}</b> has joined the conversation!</i>`
    };
    messages.push(message);
    socket.broadcast.emit('message', message);
  });

  socket.on('message', message => {
    console.log("Oh, I've got something from " + socket.id);
    messages.push(message);
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');

    let deletedUser = '';

    for (let removedUser of users) {
      if (removedUser.id === socket.id) {
        const index = users.indexOf(removedUser);
        users.splice(removedUser.id, index);

        deletedUser = removedUser.name;
      }
    }

    const message = {
      author: 'Chat Bot',
      content: `<i><b>${deletedUser}</b> has left the conversation!</i>`
    };
    messages.push(message);
    socket.broadcast.emit('message', message);
  });

  console.log("I've added a listener on message event \n");
});
