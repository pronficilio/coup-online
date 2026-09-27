import React, { Component } from 'react'
import io from "socket.io-client";
import Coup from './game/Coup';

const axios = require('axios');
const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000' 

export default class JoinGame extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            name: '',
            roomCode: '',
            players: [],
            isInRoom: false,
            isReady: false,
            isLeader: false,
            isLoading: false,
            isError: false,
            isGameStarted: false,
            codexDisabled: false,
            errorMsg: '',
            socket: null
        }
    }

    onNameChange = (name) => {
        this.setState({ name });
    }

    onCodeChange = (roomCode) => {
        this.setState({ roomCode });
    }

    joinParty = () => {
        const bind = this
        const socket = io(`${baseUrl}/${this.state.roomCode}`);
        this.setState({ socket });
        console.log("socket created")
        
        socket.on("joinSuccess", function() {
            console.log("join successful")
            // bind.setState({ isLoading: false });
            bind.setState({ isInRoom: true })
        })

        socket.on("joinFailed", function(err) {
            console.log("join failed, cause: " + err);
            bind.setState({ 
                errorMsg: err,
                isError: true,
                isLoading: false
            });
            socket.disconnect();
        })

        socket.on('leader', () => this.setState({ isLeader: true, isReady: true }))
        socket.on('startRejected', reason => this.setState({
            errorMsg: `Unable to start: ${reason}`,
            isError: true
        }))

        socket.on('startGame', () => {
            this.setState({ isGameStarted: true});
        })

        socket.on('partyUpdate', (players) => {
            console.log(players)
            this.setState({ players })
        })

        socket.on('codexDisabled', status => this.setState({
            codexDisabled: Boolean(status && status.disabled)
        }))


        socket.on('disconnected', function() {
            console.log("You've lost connection with the server")
        });
        socket.emit('setName', this.state.name);
    }

    attemptJoinParty = () => {

        if(this.state.name === '') {
            //TODO  handle error
            console.log('Please enter a name');
            this.setState({ 
                errorMsg: 'Please enter a name',
                isError: true 
            });
            return
        }
        if(this.state.roomCode === '') {
            //TODO  handle error
            console.log('Please enter a room code');
            this.setState({ 
                errorMsg: 'Please enter a room code',
                isError: true
            });
            return
        }

        this.setState({ isLoading: true });
        const bind = this
        axios.get(`${baseUrl}/exists/${this.state.roomCode}`)
            .then(function (res) {
                console.log(res)
                if(res.data.exists) {
                    //join 
                    console.log("joining")
                    bind.setState({errorMsg: ''})
                    bind.joinParty();
                } else {
                    //TODO  handle error
                    console.log('Invalid Party Code')
                    bind.setState({ 
                        isLoading: false,
                        errorMsg: 'Invalid Party Code',
                        isError: true
                    });
                }
            })
            .catch(function (err) {
                //TODO  handle error
                console.log("error in getting exists", err);
                bind.setState({ 
                    isLoading: false,
                    errorMsg: 'Server error',
                    isError: true
                });
            })
    }
    
    reportReady = () => {
        this.state.socket.emit('setReady', true);
        this.state.socket.on('readyConfirm', () => {
            this.setState({ isReady: true })
        })
    }

    emergencyStopCodex = () => {
        if (this.state.socket) this.state.socket.emit('emergencyStopCodex')
    }

    render() {
        if(this.state.isGameStarted) {
            return (<Coup
                name={this.state.name}
                socket={this.state.socket}
                isLeader={this.state.isLeader}
                isSpectator={false}
                codexDisabled={this.state.codexDisabled}
            />)
        }
        let error = null;
        let joinReady = null;
        let ready = null;
        let startGame = null;
        if(this.state.isError) {
            error = <b>{this.state.errorMsg}</b>
        }
        if(this.state.isInRoom) {
            if (!this.state.isReady) {
                joinReady = <button className="joinButton" onClick={this.reportReady}>Ready</button>
            }
        } else {
            joinReady = <button className="joinButton" onClick={this.attemptJoinParty} disabled={this.state.isLoading}>{this.state.isLoading ? 'Joining...': 'Join'}</button>
        }
        if(this.state.isReady) {
            ready = <b style={{ color: '#5FC15F' }}>You are ready!</b>
            joinReady = null
        }
        const participantCount = this.state.players.filter(player => player.participating).length
        const allParticipantsReady = this.state.players.every(player => player.kind === 'codex' || !player.participating || player.isReady)
        if(this.state.isLeader && participantCount >= 2 && allParticipantsReady) {
            startGame = <button className="startGameButton" onClick={() => this.state.socket.emit('startGameSignal')}>Start Game</button>
        }

        return (
            <div className="joinGameContainer">
                <p>Your Name</p>
                <input
                    type="text" value={this.state.name} disabled={this.state.isLoading}
                    onChange={e => {
                        if(e.target.value.length <= 8){
                            this.setState({
                                errorMsg: '',
                                isError: false
                            })
                            this.onNameChange(e.target.value);
                        } else {
                            this.setState({
                                errorMsg: 'Name must be less than 9 characters',
                                isError: true
                            })
                        }
                    }}
                />
                <p>Room Code</p>
                <input
                    type="text" value={this.state.roomCode} disabled={this.state.isLoading}
                    onChange={e => this.onCodeChange(e.target.value)}
                />
                <br></br>
                {joinReady}
                <br></br>
                {ready}
                <br></br>
                {error}
                {startGame}
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
                {this.state.isInRoom && <button
                    type="button"
                    onClick={this.emergencyStopCodex}
                    disabled={this.state.codexDisabled}
                    style={{ backgroundColor: '#b00020', color: 'white', fontWeight: 'bold', marginTop: 12 }}
                >{this.state.codexDisabled ? 'CODEX APAGADO' : 'APAGAR CODEX · EMERGENCIA'}</button>}
            </div>
        )
    }
}
