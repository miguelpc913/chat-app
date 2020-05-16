const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io') 
const Filter = require("bad-words")
const {generateMessage} = require('./utils/message')
const {generateLocation} = require('./utils/message')
const {addUser, getUser , getUsersInRoom , removeUser} = require("./utils/user")

const app = express();
const server = http.createServer(app)
const io = socketio(server);
const htmlDirectoryPath = path.join(__dirname , '../public')
console.log(htmlDirectoryPath)
app.use(express.static(htmlDirectoryPath))
const port = process.env.port || 3000;


io.on('connection' , (socket)=>{
    socket.on("join" , ({username , room} , callback)=>{
        socket.join(room)
        const {error , user} = addUser({id: socket.id , username: username , room: room})
        if(error){
            return callback(error)
        }
        socket.emit("roomData" , {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        socket.emit("sendMessage" , generateMessage("Admin" , "Welcome!"))
        socket.broadcast.to(user.room).emit("sendMessage" , generateMessage(`${user.username} has joined the chat`))
        return callback();
    })

    socket.on("clientSendMessage" , (message , callback)=>{
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback("Profanity not allowed")
        }
        const user = getUser(socket.id)
        if(!user){
            return callback("Error")
        }
        io.to(user.room).emit("sendMessage" , generateMessage(user.username , message))
        callback()
    })

    socket.on("sendLocation" , (position , callback)=>{
        const user = getUser(socket.id)
        if(!user){
            return callback("Error")
        }

        socket.broadcast.to(user.room).emit("sendLocation" , generateLocation(user.username , `https://www.google.com/maps?q=${position.latitude},${position.longitude}`))
        callback("Location Shared")
    })

    socket.on("disconnect", ()=>{
        const user = removeUser(socket.id)
        socket.emit("roomData" , {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        if(user){
            io.to(user.room).emit("sendMessage" , generateMessage("Admin",`${user.username} has left the chat`))
        }
    })
})


server.listen(port , ()=>{
    console.log("App listening in port 3000");
})