const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pino = require("express-pino-logger")();
const socketIO = require("socket.io");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const { IncomingWebhook } = require("@slack/client");
const hook = new Webhook(process.env.DISCORD_URL);
const webhook = new IncomingWebhook(process.env.SLACK_URL);
const SlackBot = require("slackbots");

const db = mysql.createConnection({
  user: process.env.BD_USER,
  host: process.env.BD_HOST,
  password: process.env.BD_PASSWORD,
  database: process.env.BD_DATABASE,
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
    if (data.username && data.password === data.confirm) {
      bcrypt.hash(data.password, 10, (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          console.log(hash);
          db.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [data.username, hash],
            (err, result) => {
              if (err) throw err;
              if (result.affectedRows === 1) {
                console.log("User create in");
                db.execute(
                  "Select * from users where username = ? AND password = ?",
                  [data.username, hash],
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
              } else {
                console.log("user not create");
                socket.emit("loginsucces", {
                  username: "",
                });
              }
            }
          );
        }
      });
    }
  });

  socket.on("login", (data) => {
    console.log(data);
    if (data.username && data.password) {
      console.log(data);
      db.execute(
        "Select * from users where username = ?",
        [data.username],
        (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            console.log(result[0].password);
            bcrypt.compare(data.password, result[0].password, (err, res) => {
              if (res) {
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
            });
          } else {
            console.log("loginfailed");
            socket.emit("loginsucces", {
              username: "!inconnu",
            });
          }
        }
      );
    } else {
      console.log("loginfailed");
      socket.emit("loginsucces", {
        username: "",
      });
    }
  });

  socket.on("create", (data) => {
    socket.join(data);
    console.log("User joined the channel " + data);
  });

  socket.on("message", (data) => {
    if (data.channel === "slack") {
      console.log(data);
      webhook.send(
        {
          username : data.username,
          text: data.message,
        },
        (err, res) => {},
        function (err, res) {
          console.log(data);
          if (err) {
            console.log("error", err);
          }
        }
      );
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
      hook.setUsername(data.username);
      hook.setAvatar(
        "https://homepages.cae.wisc.edu/~ece533/images/airplane.png"
      );
      hook.send(data.message),
        function (err, res) {
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
