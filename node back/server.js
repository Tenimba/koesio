const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const mysql = require("mysql2");
const db = mysql.createConnection({
  user: "tenimba",
  host: "localhost",
  password: "Tenimba!123",
  database: "keosio",
});

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 8080;

io.on("connection", (socket) => {
  // Get nickname and channel.

  // Join the user to the channel.

  socket.on("register", (data) => {
    console.log(data);
    db.execute(
      "Select * from users where username = ? AND password = ?",
      [data.username, data.password],
      (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          console.log("User logged in");
          socket.emit("loginsucces", {
            username: data.username,
            
          });
        } else {
          console.log("login failed");
          socket.emit("loginechec", {
            username: "",
         
          });
        }
      }
    );
  });

  // Handle disconnect
  socket.on("disconnect", () => {});
});

server.listen(PORT, () => console.log(`Server listening to port ${PORT}`));
