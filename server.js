const express = require("express");
const app = express();
const socket = require("socket.io");
const color = require("colors");
const cors = require("cors");
const {
  get_Current_User,
  user_Disconnect,
  join_User,
  getAllUsers,
  getUsersScreenRatio,
} = require("./user");

app.use(express());

const port = 8001;

app.use(cors());

var server = app.listen(
  port,
  console.log(`Server is running on the port no: ${port} `.green)
);

const io = socket(server);
const PLAYER_1 = "Player1";
const PLAYER_2 = "Player2";

let lastUserCollided = "";

//initializing the socket io connection
let users = [];
io.on("connection", (socket) => {
  //for a new user joining the room
  socket.on("joinRoom", ({ username, roomname, screenDimension }) => {
    //* create user
    const p_user = join_User(socket.id, username, roomname, screenDimension);
    const currentUser = p_user.name;
    console.log(socket.id, "=id");
    socket.join(p_user.room);

    socket.broadcast.emit("playerIndex", currentUser);

    //display a welcome message to the user who have joined a room
    socket.emit("joinMessage", {
      userId: p_user.id,
      username: p_user.username,
      text: `Welcome ${currentUser}`,
      currentUser: currentUser,
    });

    //displays a joined room message to all other room users except that particular user
    socket.broadcast.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `${currentUser} has joined the chat`,
    });

    //getUser event

    users = getAllUsers();
    socket.emit("getUsers", users);
  });

  //Player1 position data
  socket.on("positionChangeP1", (data) => {
    const { width: widthRatio, height: heightRatio } = getUsersScreenRatio();
    let relativePosition = {
      x: (1 / widthRatio) * data.x,
      y: (1 / heightRatio) * data.y,
    };
    socket.broadcast.emit("positionChangeP1", relativePosition);
  });

  //Player2 position data
  socket.on("positionChangeP2", (data) => {
    const { width: widthRatio, height: heightRatio } = getUsersScreenRatio();
    let relativePosition = {
      x: widthRatio * data.x,
      y: heightRatio * data.y,
    };
    socket.broadcast.emit("positionChangeP2", relativePosition);
  });

  socket.on("ballCollided", (data) => {
    console.log("ballCollidedWithLastUser: ", data);
    lastUserCollided = data.currentUser;
  });

  // Ball position data
  socket.on("positionChangeBall", (data) => {
    let relativePosition = { x: data.x, y: data.y };
    const { width: widthRatio, height: heightRatio } = getUsersScreenRatio();
    if (lastUserCollided === "Player1") {
      relativePosition = {
        x: (1 / widthRatio) * data.x,
        y: (1 / heightRatio) * data.y,
      };
    } else if (lastUserCollided === "Player2") {
      relativePosition = {
        x: widthRatio * data.x,
        y: heightRatio * data.y,
      };
    }

    socket.broadcast.emit("positionChangeBall", {
      ...relativePosition,
      Vx: data.Vx,
      Vy: data.Vy,
      lastUserCollided: lastUserCollided,
    });
  });

  //user sending message
  socket.on("chat", (text) => {
    //gets the room user and the message sent
    const p_user = get_Current_User(socket.id);

    io.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: text,
    });
  });

  //when the user exits the room
  socket.on("disconnect", () => {
    //the user is deleted from array of users and a left room message displayed
    const p_user = user_Disconnect(socket.id);
    const currentUser = p_user.name;
    if (p_user) {
      io.to(p_user.room).emit("message", {
        userId: p_user.id,
        username: p_user.username,
        text: `${currentUser} has left the room`,
      });
    }
  });
});
