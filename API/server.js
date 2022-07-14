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

//connection to database
const db = mysql.createConnection({
  user: "tenimba",
  host: "localhost",
  password:"tenimba!123",
  database: "koesio",
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
//verifie si le serveur est en ligne
io.on("connection", (socket) => {
  //inscription
  socket.on("register", (data) => {
    console.log(data);
    if (data.username && data.password === data.confirm) {
      //cryptage du mot de passe
      bcrypt.hash(data.password, 10, (err, hash) => {
        if (err) {
          console.log(err);
        } else {
          console.log(hash);
          //enregistrement dans la base de données
          db.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [data.username, hash],
            (err, result) => {
              if (err) throw err;
              if (result.affectedRows === 1) {
                console.log("User create in");
                //suivie de la connexion
                db.execute(
                  "Select * from users where username = ? AND password = ?",
                  [data.username, hash],
                  (err, result) => {
                    if (err) throw err;
                    if (result.length > 0) {
                      //envoie de la connexion
                      console.log("User logged in");
                      socket.emit("loginsucces", {
                        username: data.username,
                      });
                    } else {
                      //erreur de connexion
                      console.log("loginfailed");
                      socket.emit("loginsucces", {
                        username: "",
                      });
                    }
                  }
                );
              } else {
                //erreur d'enregistrement
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
//connexion
  socket.on("login", (data) => {
    console.log(data);
    
    if (data.username && data.password) {

//verifie si le pseudo existe
      db.execute(
        "Select * from users where username = ?",
        [data.username],
        (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            //decripte le mot de passe && verifie si le mot de passe est correct
            bcrypt.compare(data.password, result[0].password, (err, res) => {
              if (res) {
                //envoie de la connexion
                console.log("User logged in");
                socket.emit("loginsucces", {
                  username: data.username,
                });
              } else {
                //erreur de connexion
                console.log("loginfailed");
                socket.emit("loginsucces", {
                  username: "",
                });
              }
            });
          } else {
            //erreur de connexion
            console.log("loginfailed");
            socket.emit("loginsucces", {
              username: "!inconnu",
            });
          }
        }
      );
    } else {
      //erreur de connexion
      console.log("loginfailed");
      socket.emit("loginsucces", {
        username: "",
      });
    }
  });
//changement de channel
  socket.on("create", (data) => {
    socket.join(data);
    console.log("User joined the channel " + data);
  });
  //envoie de message
  socket.on("message", (data) => {
    //envoi de msg vers slack
    if (data.channel === "slack") {
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
      //insertion dans la base de données
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
      //envoi de msg vers discord
    } else if (data.channel === "discord") {
      hook.setUsername(data.username);
      hook.setAvatar(
        "https://homepages.cae.wisc.edu/~ece533/images/airplane.png"
      );
      hook.timestamp(data.heure);
      hook.send(data.message),
        function (err, res) {
          console.log(data);
          if (err) {
            console.log("error", err);
          }
        };
//insert msg dans la base de données
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
  //genere lhistorique sur slack
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
//genere lhistorique sur discord
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

  //deconnexion
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

//server.listen
server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
}
);
