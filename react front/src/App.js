import React from "react";
import socketClient from "socket.io-client";
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
  const [histo,sethisto] = React.useState(false);
  const [historique , sethistorique] = React.useState([]);


  const Slack = (event) => {
    socket.emit("create", "slack");
    setMenu(true);
    setChannel("slack");
  };
  const Discord = (event) => {
    socket.emit("create", "discord");
    setMenu(true);
    setChannel("discord");
  };


  const handlePseudo = (event) => {
    event.preventDefault();
    console.log();
    console.log("login: ", username, password, confirm);
    socket.emit("register", {
      username: username,
      password: password,
      confirm: confirm,
    });
    socket.on("loginsucces", (data) => {
      console.log(data);
      setConnexion(true);
      if (data.username === "") {
        setConnexion(false);
        prompt("pseudo ou mot de passe non valide");
      } else {
        setConnexion(true);
      }
      if (connexion === true) {
        console.log("connexion");
      }
    });
  };

  const handleconnexion = (event) => {
    event.preventDefault();
    console.log("login: ", username, password);
socket.emit("login", {
  username: username,
  password: password,
});
socket.on("loginsucces", (data) => {
  console.log(data);
  setConnexion(true);
  if (data.username === "") {
    setConnexion(false);
    prompt("login ou mot de passe incorrect");
  } else {
    setConnexion(true);
  }
  if (connexion === true) {
    console.log("connexion");
  }
}
);
  };
const Historique = (event) => {
  event.preventDefault();
  console.log("historique");
  socket.emit("historique", {
    username: username,
  });
  sethisto(true);

  socket.on("historique_send", (data) => {
    sethistorique(data.historique);
    console.log(data);
  }
  );
}

  const handleMessage = (event) => {
    event.preventDefault();
    socket.emit("message", {
      message: message,
      channel: channel,
      username: username,
      time: time,
    });
    console.log(message, channel, username, time);

    socket.on("message_send", (data) => {
      console.log(data.username);
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

 
  if (connexion === false) {
    return (
      <div className="flex justify-center text-center p-5 solid">
        <div className="inscription">
          <h1>Bienvenue </h1>
          <div className="p-8">
            <span className="label">Inscription</span>
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
            <button className="button" onClick={handlePseudo}>
              Se connecter
            </button>
          </form>
        </div>
<div className="connexion">
<span className="label">connexion</span>
         
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
            <button className="button" onClick={handleconnexion}>
              Se connecter
            </button>
          </form>
          </div>
      </div>
    );
    
  } else if (connexion === true && menu === false) {
    return (
      <div className="menu">
        <li onClick={Slack}>Slack</li>
        <li onClick={Discord}>Discord</li>
      
      </div>
    );
  } else if (connexion === true && menu === true && histo === false) {
    return (
      <div>
        <div className="menu">
          <li onClick={Slack}>Slack</li>
          <li onClick={Discord}>Discord</li>
          <li onClick={Historique}>historique</li>
        </div>

        <div className="text-center name">
          <em>
            Bienvenue {username} sur {channel}{" "}
          </em>
        </div>

        <div >
          <div className="border">
            {text.map((message, index) => (
              <div key={index}>
                <div> user :{message.username} </div>
                <div> message : {message.message} </div>
                <div> envoyer a {message.time} </div>
                <div> envoyer vers : {message.channel} </div>
                <br />
              </div>
            ))}
          </div>
        </div>
        <form>
          <label>
            <p> taper votre message</p>
            <textarea
              type="text"
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <br />
          <button onClick={handleMessage}>Send</button>
        </form>
      </div>
    );
  }
  else if(histo === true){
    return(
      <div className="text-center name">
      <h1>
      voici l'historique de {username}
      </h1>
      <table>
      <tr>
      <th>message</th>
      <th>channel</th>
      <th>time</th>
      </tr>
      {historique.map((message, index) => (
        <tr key={index}>
        <td>{message.message}</td>
        <td>{message.channel}</td>
        <td>{message.time}</td>
        </tr>
      ))}
      </table>
    </div>
    )
  }
}

export default App;
