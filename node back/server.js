const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
const socketIO = require("socket.io");
const mysql = require("mysql2");
const {Webhook} = require("discord-webhook-node");
const { IncomingWebhook } = require("@slack/client");
const hook = new Webhook(
  "https://discord.com/api/webhooks/996100194372419755/fvloelnmNuYcvw3WJH5IJTtz6qBWeH9dnoECjwu_DKQx8_KM41tMMN-rhegmCC-6rV9v"
);
const url =
  "https://hooks.slack.com/services/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";
const webhook = new IncomingWebhook(url);

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


  socket.on("register", (data) => {
    console.log(data);
    if(data.password === data.confirm){
    db.execute(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [data.username, data.password],
      (err, result) => {
        if (err) throw err;
        if (result.affectedRows === 1) {
          console.log("User create in");
         socket.emit('login', {
            username: data.username,
            password: data.password,
            });
   
        } else {
          console.log("user not create");

        }
      }
    );
    }
  });

  socket.on("login", (data) => {
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

  socket.on("create", (data) => {
    socket.join(data);
    console.log("User joined the channel " + data);
  });

  socket.on("message", (data) => {
    if (data.channel === "slack") {
      webhook.send(data.message, function (err, res) {
        console.log(data);
        if (err) {
          console.log("error", err);
        }
      });
      db.execute(
        "INSERT INTO slacks (username, message, time ) VALUES (?,?,?)",
        [data.username, data.message, data.time],
        (err, result) => {
          if (err) throw err;
          if (result) {
            socket.emit("message_send", {
              username: data.username,
              channel: data.channel,
              message: data.message,
            });
          }
        }
      );
    } else if (data.channel === "discord") {
      hook.send(data.message, function (err, res) {
        console.log(data);
        if (err) {
          console.log("error", err);
        }
      });

      db.execute(
        "INSERT INTO discord (username, message, time) VALUES (?, ?, ?)",
        [data.username, data.message, data.time],
        (err, result) => {
          if (err) throw err;
          console.log("Message sent");
          socket.emit("message_send", {
            username: data.username,
            channel: data.channel,
            message: data.message,
          });
        }
      );
    }
  });

  socket.on("historique", (data) => {
    db.execute(
      "SELECT * FROM slacks WHERE username = ?",
      [data.username],
      (err, result) => {
        console.log(result);
        if (err) throw err;
        if (result.length > 0) {
          socket.emit("historique_send", {
            username: data.username,
            channel: "slack",
            historique: result,
          });
        }
      }
    );
    db.execute(
      "SELECT * FROM discord WHERE username = ?",
      [data.username],
      (err, result) => {
        console.log(result);
        if (err) throw err;
        if (result.length > 0) {
          socket.emit("historique_send", {
            username: data.username,
            channel: "discord",
            historique: result,
          });
        }
      }
    );
    });                                    

  socket.on("disconnect", () => {});
});

server.listen(PORT, () => console.log(`Server listening to port ${PORT}`));
