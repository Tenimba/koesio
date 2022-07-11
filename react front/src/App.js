import React from "react";
import socketClient from "socket.io-client";
const server = "http://localhost:8080";


function App() {
  var socket = socketClient(server);
  socket.on("connect", function () {});
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [connexion , setConnexion] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [select , setSelect] = React.useState("");
  const options = [
    { value: 'slack', label: 'slack' },
    { value: 'discord', label: 'discord' },
 
  ]
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
    if(data.username === '') {
      setConnexion(false);
    }else {
      setConnexion(true);
      
    }
    if(connexion === true) {
      console.log('connexion');
    }    
    });
  };

  const handleMessage = (event) => {
    event.preventDefault();
    console.log(message);
    console.log(select);
  }


if(connexion === false){
  return (
    <div className="flex justify-center text-center p-5 solid">
      <div className="username">
        <h1>Bienvenue </h1>
        <div className="p-8">
          <span className="label">connexion</span>
        </div>
        <form>
          <label>
            <p>Username</p>
            <input type="text" onChange={(e) => setUsername(e.target.value)} />
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
    </div>
  
  );

  } else {
    return (
      <div>
      <form>
        <label>
          <p>message</p>
          <textarea type="text" 
          onChange={(e) => setMessage(e.target.value)}/>
        </label>
        <br/>
        <label>
      channel 
        <select  onChange={(e) => setSelect(e.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          </select>



        </label>
          <button onClick={handleMessage}>Send</button>

      </form>
    </div>
    )
  }

}
export default App;
