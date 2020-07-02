const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const uuid = require("uuid");

const PORT = process.env.PORT || 8000;
const BOT = "bot";
const RESET_TIME = 30 * 1000;
const chat = [];

function botMessage(socket, message) {
  socket.emit("message-send", {
    username: BOT,
    message: message,
  });
}

function botBroadcast(socket, message) {
  socket.broadcast.emit("message-send", {
    username: BOT,
    message: message,
  });
}

io.on("connect", (socket) => {
  socket.emit("message-load", chat);
  botMessage(socket, "Welcome to the chat!");

  socket.on("user-join", (data) => {
    botBroadcast(socket, `${data} has joined the chat.`);
  });

  socket.on("message-send", (data) => {
    io.emit("message-send", data);
    const newMessage = { ...data, id: uuid.v4() };
    chat.push(newMessage);
    setTimeout(() => {
      chat.splice(
        chat.findIndex((message) => message.id === newMessage.id),
        1
      );
      io.emit("message-load", chat);
    }, RESET_TIME);
  });

  socket.on("user-left", (data) => {
    botBroadcast(socket, `${data} has left the chat.`);
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
