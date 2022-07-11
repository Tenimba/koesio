import React from "react";


function Chat() {

    const [message , setMessage] = React.useState("");

    const handleMessage = (event) => {
        event.preventDefault();
        setMessage(event.target.value);
    }

    return (
        <div>
        <form>
          <label>
            <p>message</p>
            <input type="text" 
            onChange={(e) => setMessage(e.target.value)}/>
          </label>

          <label>
channel 
<select name="channel" id="channel">
    <option value="accueil">accueil</option>
    <option value="general">general</option>
    <option value="random">random</option>
    </select>

          </label>
            <button onClick={() => {
                handleMessage(message);
            }}>Send</button>

        </form>
      </div>
    )
}