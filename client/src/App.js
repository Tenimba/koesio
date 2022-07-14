import React from "react";
import socketClient from "socket.io-client";
import { slide as Menu } from "react-burger-menu";
import "./App.css";
const server = "http://localhost:8080";

function App() {
  var socket = socketClient(server);
  socket.on("connect", function () {});
  const [inscription, setInscription] = React.useState(false);
  const [connexion, setConnexion] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [message, setMessage] = React.useState("");
  const time = new Date().getHours() + ":" + new Date().getMinutes();
  const [text, setText] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [channel, setChannel] = React.useState("");
  const [histo, sethisto] = React.useState(false);
  const [discord, setdiscord] = React.useState([]);
  const [slack, setslack] = React.useState([]);
  const [heure, setHeure] = React.useState('');

  //join channel slack
  const Slack = (event) => {
    socket.emit("create", "slack");
    setMenu(true);
    sethisto(false);
    setChannel("slack");
  };
  //join channel discord
  const Discord = (event) => {
    socket.emit("create", "discord");
    setMenu(true);
    sethisto(false);
    setChannel("discord");
  };

  // inscription
  const handlePseudo = (event) => {
    event.preventDefault();

    //inscription
    socket.emit("register", {
      username: username,
      password: password,
      confirm: confirm,
    });
    //success or error
    socket.on("loginsucces", (data) => {
      console.log(data);
      setConnexion(true);
      if (data.username === "") {
        setConnexion(false);
        alert("pseudo ou mot de passe non valide");
      } else {
        setConnexion(true);
      }
      if (connexion === true) {
        console.log("connexion");
      }
    });
  };

  //connexion
  const handleconnexion = (event) => {
    event.preventDefault();
    //connexion
    socket.emit("login", {
      username: username,
      password: password,
    });
    //success or error
    socket.on("loginsucces", (data) => {
      console.log(data);
      setConnexion(true);
      if (data.username === "") {
        setConnexion(false);
        alert("login ou mot de passe incorrect");
      } else if (data.username == "!inconnu") {
        setConnexion(false);
        alert(
          "utilisateur inconnu merci de vous inscrire avant de vous connecter"
        );
      } else {
        setConnexion(true);
      }

      if (connexion === true) {
        console.log("connexion");
      }
    });
  };
  socket.on("loginfailed", (data) => {
    console.log("failed");
    setConnexion(false);
    alert("login ou mot de passe incorrect");
  });

  //historique
  const Historique = (event) => {
    event.preventDefault();
    console.log("historique");
    socket.emit("historique", {
      username: username,
    });
    sethisto(true);
    //historique slack
    socket.on("historique_slack", (data) => {
      console.log(data);
      setslack(data.historique);
    });
    //historique discord
    socket.on("historique_discord", (data) => {
      setdiscord(data.historique);
      console.log(data);
    });
  };

  //message
  const handleMessage = (event) => {
    event.preventDefault();
    //envoyer message
    socket.emit("message", {
      message: message,
      channel: channel,
      username: username,
      time: time,
      heure : heure
    });

    //recuperer message
    socket.on("message_send", (data) => {
      var messag = [
        {
          username: data.username,
          channel: channel,
          message: data.message,
          time: time,
        },
      ];
      setText(messag.concat(text));
    });
  };

  // deconnection
  const Disconnect = (event) => {
    event.preventDefault();
    setMenu(false);
    setConnexion(false);
    setText([]);
    socket.emit("disconnect", {
      username: username,
    });
  };
  //retour a l'accueil
  const Accueil = (event) => {
    event.preventDefault();
    setMenu(false);
    setConnexion(true);
    sethisto(false);
  };
  //verifcation de la connexion
  if (connexion === false) {
    return (
      <div className="entre">
        <h1 className="bienvenu">Bienvenue </h1>
        <div className="inscription">
          <div className="p-8">
            <h3 className="label">Inscription</h3>
          </div>
          <form>
            <label>
              <p>Username</p>
              <input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              <p>Password</p>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label>
              <p>confirm</p>
              <input
                type="password"
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            <br />
            <button className="button" onClick={handlePseudo}>
              S'inscrire
            </button>
          </form>
        </div>
        <div className="connexion">
          <h3 className="label">connexion</h3>
          <form>
            <label>
              <p>Username</p>
              <input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label>
              <p>Password</p>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <br />
            <button className="button" onClick={handleconnexion}>
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
    //connectez
  } else if (connexion === true && menu === false) {
    return (
      <div>
        <Menu>
          <br />
          <a className="a" onClick={Discord}>
            channel Discord
          </a>
          <br />
          <a className="a" onClick={Slack}>
            channel Slack
          </a>
          <br />
          <a className="a" onClick={Historique}>
            Historique
          </a>
        </Menu>
        <div>
          <button className="deconnect" onClick={Disconnect}>
            Deconnecter
          </button>
        </div>
      </div>
    );
    //connectez && menu select channel
  } else if (connexion === true && menu === true && histo === false) {
    return (
      <div className="affichage">
        <Menu>
          <a className="a" onClick={Discord}>
            channel Discord
          </a>
          <br />
          <a className="a" onClick={Slack}>
            channel Slack
          </a>
          <br />
          <a className="a" onClick={Historique}>
            Historique
          </a>
        </Menu>
        <div>
          <button className="deconnect" onClick={Disconnect}>
            Deconnecter
          </button>
        </div>

        <h2 className="name">
          Bienvenue <u> {username} </u> sur <em> {channel}</em>
        </h2>

        <div className="message">
          <div>
            <div className="border">
              {text.map((message, index) => (
                <div key={index}>
                  <div>
                    {" "}
                    <em className="user">message : </em> {message.message}{" "}
                  </div>
                  <div>
                    {" "}
                    <em className="user">envoyer a </em> {message.time}{" "}
                  </div>
                  <div>
                    {" "}
                    <em className="user"> envoyer vers : </em> {message.channel}{" "}
                  </div>
                  <div>
                    {" "}
                    <em className="user"> heure defini sur  : </em> {message.heure}{" "}
                  </div>
                  <br />
                </div>
              ))}
            </div>
          </div>
          <form className="msg">
            <label>
              <textarea
                type="text"
                className="text"
                onChange={(e) => setMessage(e.target.value)}
              />
              <label className="horraire">
                <input type="timestamp" onChange={(e) => setMessage(e.target.value)} />
                </label>
                
            </label>
            <button className="send" onClick={handleMessage}>
              Send
            </button>
          </form>
        </div>
      </div>
    );
    //affichage historique
  } else if (histo === true) {
    return (
      <div className=" name">
        <Menu>
          <a className="a" onClick={Discord}>
            channel Discord
          </a>
          <br />
          <a className="a" onClick={Slack}>
            channel Slack
          </a>
          <br />
          <a className="a" onClick={Historique}>
            Historique
          </a>
        </Menu>
        <div>
          <button className="deconnect" onClick={Disconnect}>
            Deconnecter
          </button>
        </div>
        <br />
        <div className="historique">
          <table>
            <td colspan={2} rowSpan={1}>
              {" "}
              <h3>
                {" "}
                voici l'historique de <em>{username}</em> sur slack{" "}
              </h3>
            </td>
            <tr>
              <th>Message</th>
              <th>Heure</th>
            </tr>
            {slack.map((message, index) => (
              <tr key={index}>
                <td>{message.message}</td>
                <td>{message.time}</td>
              </tr>
            ))}
          </table>
          <h3 className="title"></h3>
          <table>
            <td colspan={2} rowSpan={1}>
              {" "}
              <h3>
                {" "}
                voici l'historique de <em>{username}</em> sur discord{" "}
              </h3>
            </td>
            <tr>
              <th>Message</th>
              <th>Heure</th>
            </tr>
            {discord.map((message, index) => (
              <tr key={index}>
                <td>{message.message}</td>
                <td>{message.time}</td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    );
  }
}

export default App;
