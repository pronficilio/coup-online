import React, { Component } from 'react'
import io from "socket.io-client";
import Coup from './game/Coup';

const axios = require('axios');
const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"

export default class CreateGame extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            name: '',
            roomCode: '',
            copied: false,
            isInRoom: false,
            isLoading: false,
            players: [],
            isError: false,
            isGameStarted: false,
            errorMsg: '',
            isLeader: false,
            isCodexAvailable: false,
            isAIAuthorized: false,
            aiCode: '',
            aiEffort: 'medium',
            isSpectating: false,
            codexDisabled: false,
            socket: null,

        }
    }

    onNameChange = (name) => {
        this.setState({ name });
    }

    joinParty = () => {
        const bind = this
        const socket = io(`${baseUrl}/${this.state.roomCode}`);
        this.setState({ socket });
        console.log("socket created")
        
        socket.on("joinSuccess", function() {
            console.log("join successful")
            bind.setState({ 
                isLoading: false,
                isInRoom: true
            });
        })

        socket.on("joinFailed", function(err) {
            console.log("join failed, cause: " + err);
            bind.setState({ isLoading: false });
        })

        socket.on('startGame', () => this.setState({ isGameStarted: true }))
        socket.on('startRejected', reason => this.setState({
            errorMsg: `Unable to start: ${reason}`,
            isError: true
        }))

        socket.on("leader", function() {
            console.log("You are the leader")
            bind.setState({ isLeader: true })
        })

        socket.on('partyUpdate', (players) => {
            console.log(players)
            this.setState({ players })
        })

        socket.on('codexAvailable', status => this.setState({
            isCodexAvailable: Boolean(status && status.available)
        }))
        socket.on('codexAuthorizationResult', result => {
            const authorized = Boolean(result && result.authorized)
            this.setState({
                isAIAuthorized: authorized,
                aiCode: '',
                errorMsg: authorized ? '' : 'AI access code was rejected.',
                isError: !authorized
            })
        })
        socket.on('codexDisabled', status => this.setState({
            codexDisabled: Boolean(status && status.disabled)
        }))

        socket.on('disconnected', function() {
            console.log("You've lost connection with the server")
        });
        socket.emit('setName', this.state.name);
    }

    createParty = () => {
        if(this.state.name === '') {
            //TODO  handle error
            console.log('Please enter a name');
            this.setState({ errorMsg: 'Please enter a name' });
            this.setState({ isError: true });
            return
        }

        this.setState({ isLoading: true });
        const bind = this;
        axios.get(`${baseUrl}/createNamespace`)
            .then(function (res) {
                console.log(res);
                bind.setState({ roomCode: res.data.namespace, errorMsg: '' });
                bind.joinParty();
            })
            .catch(function (err) {
                //TODO  handle error
                console.log("error in creating namespace", err);
                bind.setState({ isLoading: false });
                bind.setState({ errorMsg: 'Error creating room, server is unreachable' });
                bind.setState({ isError: true });
            })
    }

    startGame = () => {
        this.state.socket.emit('startGameSignal')
    }

    authorizeCodex = () => {
        if (!this.state.socket || !this.state.aiCode) return
        const code = this.state.aiCode
        this.setState({ aiCode: '', errorMsg: '', isError: false })
        this.state.socket.emit('authorizeCodexAI', { code })
    }

    addCodexSeat = () => {
        if (this.state.socket) this.state.socket.emit('addCodexSeat', { effort: this.state.aiEffort })
    }

    removeCodexSeat = () => {
        if (this.state.socket) this.state.socket.emit('removeCodexSeat')
    }

    setSpectating = event => {
        const participating = event.target.checked
        const isSpectating = !participating
        this.setState({ isSpectating })
        if (this.state.socket) this.state.socket.emit('setParticipating', participating)
    }

    emergencyStopCodex = () => {
        if (this.state.socket) this.state.socket.emit('emergencyStopCodex')
    }

    copyCode = () => {
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = this.state.roomCode;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
        this.setState({copied: true})
    }

    render() {
        if(this.state.isGameStarted) {
            return (<Coup
                name={this.state.name}
                socket={this.state.socket}
                isLeader={this.state.isLeader}
                isSpectator={this.state.isSpectating}
                codexDisabled={this.state.codexDisabled}
            />)
        }
        let error = null;
        let roomCode = null;
        let startGame = null;
        let createButton = null;
        if(!this.state.isInRoom) {
            createButton = <>
            <button className="createButton" onClick={this.createParty} disabled={this.state.isLoading}>{this.state.isLoading ? 'Creating...': 'Create'}</button>
            <br></br>
            </>
        }
        if(this.state.isError) {
            error = <b>{this.state.errorMsg}</b>
        }
        if(this.state.roomCode !== '' && !this.state.isLoading) {
            roomCode = <div>
                    <p>ROOM CODE: <br></br> <br></br><b className="RoomCode" onClick={this.copyCode}>{this.state.roomCode} <span className="iconify" data-icon="typcn-clipboard" data-inline="true"></span></b></p>
                    {this.state.copied ? <p>Copied to clipboard</p> : null}
                </div>
        }
        const participantCount = this.state.players.filter(player => player.participating).length
        const allParticipantsReady = this.state.players.every(player => player.kind === 'codex' || !player.participating || player.isReady)
        if(this.state.isLeader && participantCount >= 2 && allParticipantsReady) {
            startGame = <button className="startGameButton" onClick={this.startGame}>Start Game</button>
        }
        return (
            <div className="createGameContainer">
                <p>Please enter your name</p>
                <input
                    type="text" value={this.state.name} disabled={this.state.isLoading || this.state.isInRoom}
                    onChange={e => {
                        if(e.target.value.length <= 10){
                            this.setState({
                                errorMsg: '',
                                isError: false
                            })
                            this.onNameChange(e.target.value);
                        } else {
                            this.setState({
                                errorMsg: 'Name must be less than 11 characters',
                                isError: true
                            })
                        }
                        
                    }}
                />
                <br></br>
                {createButton}
                {error}
                <br></br>
                {roomCode}
                <div className="readyUnitContainer">
                        {this.state.players.map((item,index) => {
                            let ready = null
                            let readyUnitColor = '#E46258'
                            if(item.kind === 'codex') {
                                ready = <b>GPT-6 Luna · {item.effort}</b>
                                readyUnitColor = '#8C6CE6'
                            } else if(!item.participating) {
                                ready = <b>Spectator</b>
                                readyUnitColor = '#8A8A8A'
                            } else if(item.isReady) {
                                ready = <b>Ready!</b>
                                readyUnitColor = '#73C373'
                            } else {
                                ready = <b>Not Ready</b>
                            }
                            return (
                                    <div className="readyUnit" style={{backgroundColor: readyUnitColor}} key={index}>
                                        <p>{index+1}. {item.name} {ready}</p>
                                    </div>
                            )
                            })
                        }
                </div>

                {this.state.isInRoom && this.state.isLeader && <label>
                    <input type="checkbox" checked={!this.state.isSpectating} onChange={this.setSpectating} /> Include me as a player
                </label>}

                {this.state.isInRoom && this.state.isLeader && this.state.isCodexAvailable && !this.state.codexDisabled && !this.state.isAIAuthorized && <div>
                    <p>Enable AI seats with the shared test code</p>
                    <input
                        type="password"
                        value={this.state.aiCode}
                        autoComplete="off"
                        aria-label="Shared AI access code"
                        onChange={event => this.setState({ aiCode: event.target.value })}
                    />
                    <button onClick={this.authorizeCodex}>Enable AI seats</button>
                </div>}

                {this.state.isInRoom && this.state.isLeader && this.state.isAIAuthorized && !this.state.codexDisabled && <div>
                    <label>
                        Codex effort{' '}
                        <select value={this.state.aiEffort} onChange={event => this.setState({ aiEffort: event.target.value })}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </label>
                    <button onClick={this.addCodexSeat} disabled={participantCount >= 6}>Add GPT-6 Luna seat</button>
                    {this.state.players.some(player => player.kind === 'codex') && <button onClick={this.removeCodexSeat}>Remove last AI seat</button>}
                </div>}

                {this.state.isInRoom && <div>
                    <button
                        type="button"
                        onClick={this.emergencyStopCodex}
                        disabled={this.state.codexDisabled}
                        style={{ backgroundColor: '#b00020', color: 'white', fontWeight: 'bold', marginTop: 12 }}
                    >{this.state.codexDisabled ? 'CODEX APAGADO' : 'APAGAR CODEX · EMERGENCIA'}</button>
                </div>}
                
                {startGame}
            </div>
                
        )
    }
}
