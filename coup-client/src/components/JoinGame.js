import React, { Component } from 'react'
import io from "socket.io-client";
import Coup from './game/Coup';
import { t } from '../i18n'
import { lobbyError } from '../i18n/lobby'

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
                errorMsg: lobbyError(err),
                isError: true,
                isLoading: false
            });
            socket.disconnect();
        })

        socket.on('leader', () => this.setState({ isLeader: true, isReady: true }))
        socket.on('startRejected', reason => this.setState({
            errorMsg: t('lobby.error.startRejected', { reason: lobbyError(reason) }),
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
                errorMsg: t('lobby.name.required'),
                isError: true 
            });
            return
        }
        if(this.state.roomCode === '') {
            //TODO  handle error
            console.log('Please enter a room code');
            this.setState({ 
                errorMsg: t('lobby.roomCode.required'),
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
                        errorMsg: t('lobby.join.invalidRoomCode'),
                        isError: true
                    });
                }
            })
            .catch(function (err) {
                //TODO  handle error
                console.log("error in getting exists", err);
                bind.setState({ 
                    isLoading: false,
                    errorMsg: t('lobby.join.serverError'),
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
                joinReady = <button className="joinButton" onClick={this.reportReady}>{t('lobby.ready.button')}</button>
            }
        } else {
            joinReady = <button className="joinButton" onClick={this.attemptJoinParty} disabled={this.state.isLoading}>{this.state.isLoading ? t('lobby.join.loading'): t('lobby.join.submit')}</button>
        }
        if(this.state.isReady) {
            ready = <b style={{ color: '#5FC15F' }}>{t('lobby.ready.confirmed')}</b>
            joinReady = null
        }
        const participantCount = this.state.players.filter(player => player.participating).length
        const allParticipantsReady = this.state.players.every(player => player.kind === 'codex' || !player.participating || player.isReady)
        if(this.state.isLeader && participantCount >= 2 && allParticipantsReady) {
            startGame = <button className="startGameButton" onClick={() => this.state.socket.emit('startGameSignal')}>{t('lobby.start')}</button>
        }

        return (
            <div className="joinGameContainer">
                <p>{t('lobby.name.label')}</p>
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
                                errorMsg: t('lobby.join.nameMaxLength'),
                                isError: true
                            })
                        }
                    }}
                />
                <p>{t('lobby.roomCode.inputLabel')}</p>
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
                                ready = <b>{t('lobby.ai.seat.status', { effort: t(`lobby.ai.effort.${item.effort}`) })}</b>
                                readyUnitColor = '#8C6CE6'
                            } else if(!item.participating) {
                                ready = <b>{t('lobby.player.spectator')}</b>
                                readyUnitColor = '#8A8A8A'
                            } else if(item.isReady) {
                                ready = <b>{t('lobby.player.ready')}</b>
                                readyUnitColor = '#73C373'
                            } else {
                                ready = <b>{t('lobby.player.notReady')}</b>
                            }
                            return (
                                    <div className="readyUnit" style={{backgroundColor: readyUnitColor}} key={index}>
                                        <p>{index+1}. {item.name} {ready}</p>
                                    </div>
                            )
                            })
                        }
                </div>
            </div>
        )
    }
}
