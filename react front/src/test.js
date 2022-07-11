import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import "./App.css";
import DOMPurify from "dompurify";

import { ReactMic } from 'react-mic';

const socket = openSocket('http://localhost:3001');

class App extends Component {

    constructor(props) {
        var today = new Date(),
        time = today.getHours() + ':' + today.getMinutes() ;
        var socket = socketClient(server);
        socket.on("connect", function() {
          console.log("connected");
        });
        super(props);
        this.state = {
          password: '',
          confirm: '',
          username: '',
            channelSelected: '#accueil',
            username : 'invité',
            usertemp : '',
            temp : '',
            tempMessage : '',
            time: time,
            channels: [],
            messages : [],
           dure : new Date().getMinutes(),
            users : [],
            chaine: '<br/>',
            record: false,
        }
    }        

    handlePseudo(event) {
      event.preventDefault();
      socket.emit('login', { username : this.state.username , password : this.state.password , confirm : this.state.confirm });
      this.setState({ username: this.state.usertemp })
  }

    render() {
        const {
            showEmojiPicker,
          } = this.state;

        if(this.state.username === 'invité') {
            return (
                <div className="flex justify-center text-center p-5 solid">
                    <div className="username">
                        <h1>Bienvenue</h1>
                        <div className="p-8">
                            <span className="label">
                            connexion
                            </span>
                        </div>
                        <form>
                            <input className='input' type="text" placeholder='pseudo' onChange={(e) => this.setState({pseudo: e.target.value})}/>
                            <input type="text" className="input" placeholder="mot de passe" onChange={(e) => this.setState({password: e.target.value})}/>
                            <input type="password" placeholder='confirm password' onChange={(e) => this.setState({confirm: e.target.value})}/>
                            <button className="button"  onClick={this.handlePseudo}>Se connecter</button>
                        </form>
                    </div>
                </div>
            )
        }
        if(this.state.username !== '') {
            return (
                <div>
                <div className="App">
                    <div className="flex justify-center py-5">
                        <div className="max-w-sm bg-white border-2 border-gray-300 p-6 rounded-md tracking-wide shadow-lg">
                            <div className="rounded text-center relative -mb-px  px-8">
                               liste des channels <br/>
                                {this.Channel()} <br/>
                            </div>
           
                              <div className="text-center">
                           <form> 
                                <input className='text-sm sm:text-base text-center relative w-full border rounded placeholder-gray-400 focus:border-indigo-400 focus:outline-none py-2 pr-2' type="text" placeholder='cree un nouveau channel ' onChange={this.onChange}/>
                                <button onClick={this.handleChannel}>Envoyer</button>
                           </form>
                                </div>
                         </div>
                    </div>
                    <div className="flex justify-center rounded-lg  p-16 test">
                    <div className="text-center name">
                                <em>Bienvenue { this.state.username } sur le channel {this.state.channelSelected}</em>
                    </div> 
                        <div className="grid place-items-center w-4/5 mx-auto p-10 my-20 sm:my-auto bg-gray-50 border rounded-xl shadow-2xl space-y-5 text-center affiche">
                            <div>   
                                <div id="content">
                                    {this.Message()}
                                    
                                </div>
                            </div>
                        </div>
                    <div className="flex justify-center bas" >

                        <span className="border rounded-lg">
                            <div className="sendForm">
                            <form >
                                    <input  className="" id="msg" value={this.state.temp} onChange={ this.handleChange }/>
                                    <button  className="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition bg-gray-300 rounded-full shadow ripple waves-light hover:shadow-lg focus:outline-none hover:bg-black" onClick={this.handleMessage}>Envoyer</button>
                                </form>
                                <div>
                            <ReactMic
                            record={this.state.record}
                            className="sound-wave"
                            onStop={(e) => this.onStop(e)}
                            onData={this.onData}
                            strokeColor="#000000"
                            mimeType = " audio/mp3" 
                        height={50}
                            backgroundColor="transparent" />
                            <button onClick={this.startRecording} type="button">Start</button>
                            <button onClick={this.stopRecording} type="button">Stop</button>
                        </div>
                            </div>
                        </span>
                    </div>
                </div>
                
                    
                    <div className="bg-grey-200">
                    <footer className="flex flex-wrap items-center justify-between p-3 m-auto">
                        <div className="container mx-auto flex flex-col flex-wrap items-center justify-between">
                            <div className="members">
                                Liste des membres
                            {this.affichageMenbre()}
                            </div>
                        </div>
                    </footer>
                    </div>
              
                </div>
                </div>
                
            )
        }
        return (<p> {this.state.username} est rentré sur le channel</p>);
    }
}

export default App;