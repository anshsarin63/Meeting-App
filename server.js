const { Socket } = require("dgram");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));


app.get('/',(req,res)=>{
    res.redirect(`/${uuidv4()}`);
});
app.get('/:room',(req,res)=>{
    res.render('room',{roomId:req.params.room});
})

io.on('connection',(socket)=>{
  socket.on('join-room',(roomId,userId)=>{
    // console.log(userId,roomId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected',userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
    socket.on('disconnect',()=>{
      socket.to(roomId).broadcast.emit('user-disconnected',userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});
