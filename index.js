const http = require('http');
const express = require('express');
const cors = require("cors")
const socketIO = require("socket.io");
const app = express();
const port = process.env.PORT || 7050
// use cors
app.use(cors())
// use server
const server = http.createServer(app);
const io = socketIO(server);

// code socket io for find users
let users = []
const addUser = (userId, socketId, userInfo) => {
    console.log(userId);
    !users.some((user)=> user.userId === userId) && users.push({userId, socketId, userInfo})
}

function removeUser(socketId) {
    users = users.filter((user) => user.socketId !== socketId);
}

const getUsers = (userId) => {
    return users.find((user)=> user.userId ===  userId)
}

io.on("connection", (socket) => {
    console.log("a user connected");
    // io.to(si).emit("welcome", "hello this is socket server")
    // take userId and socket id 
    socket.on("addUser", (userId,userInfo) => {
        addUser(userId, socket.id, userInfo)
        io.emit("getUsers", users)
    })

    // send message
    socket.on("sendMessage", ({ senderId, receverId, text }) => {
        const user = getUsers(receverId)
        io.to(user?.socketId).emit("getMessage", {
            senderId,
            text,
       })
    })
    socket.on("disconnect", () => {
        console.log("a user disconnected");
        removeUser(socket.id)  
        io.emit("getUsers", users)
    })
})
// server lisien
server.listen(port, () => {
    console.log('listening on *:5000');
  });