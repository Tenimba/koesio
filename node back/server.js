const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
const socketIO = require("socket.io");
const mysql = require("mysql2");
const {Webhook, MessageBuilder} = require("discord-webhook-node");
const { IncomingWebhook } = require("@slack/client");
const discord_url = `${process.env.DISCORD_URL}`;
const hook = new Webhook(discord_url);
const slack_url = `${process.env.SLACK_URL}`;
const webhook = new IncomingWebhook(slack_url);

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
                console.log("loginfailed");
                socket.emit("loginsucces", {
                  username: "",
                });
              }
            }
          );;
   
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
          console.log("loginfailed");
          socket.emit("loginsucces", {
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
      webhook.setUsername(data.username);
     webhook.setAvatar('https://homepages.cae.wisc.edu/~ece533/images/airplane.png')
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
    
      hook.setUsername(data.username)
      hook.setAvatar('https://homepages.cae.wisc.edu/~ece533/images/airplane.png')
      hook.send(data.message), function (err, res) {
        console.log(data);
        if (err) {
          console.log("error", err);
        }
      };

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
          socket.emit("historique_slack", {
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
          socket.emit("historique_discord", {
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
