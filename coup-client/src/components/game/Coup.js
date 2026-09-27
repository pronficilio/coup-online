import React, { Component } from 'react'
import PlayerBoard from './PlayerBoard'
import './CoupStyles.css'
import EventLog from './EventLog'
import CheatSheetModal from '../CheatSheetModal'
import RulesModal from '../RulesModal'
import ReferencePanel from './ReferencePanel'
import ResponseImageButton from './ResponseImageButton'
import blockAssassinationImage from '../../assets/action-buttons/ba.webp'
import blockAssassinationActiveImage from '../../assets/action-buttons/ba-active.webp'
import blockForeignAidImage from '../../assets/action-buttons/bfa.webp'
import blockForeignAidActiveImage from '../../assets/action-buttons/bfa-active.webp'
import blockStealImage from '../../assets/action-buttons/bs.webp'
import blockStealActiveImage from '../../assets/action-buttons/bs-active.webp'
import challengeImage from '../../assets/action-buttons/c.webp'
import challengeActiveImage from '../../assets/action-buttons/c-active.webp'
import claimImage from '../../assets/action-buttons/claim.webp'
import passImage from '../../assets/action-buttons/pass.webp'
import passActiveImage from '../../assets/action-buttons/pass-active.webp'

const INFLUENCE_COLORS = {
    duke: '#D55DC7',
    captain: '#80C6E5',
    assassin: '#2B2B2B',
    contessa: '#E35646',
    ambassador: '#B4CA1F'
}

const RESPONSE_WINDOW_TYPES = new Set(['challenge', 'block', 'block_challenge'])

function responseButtonFor(decision, option) {
    if (!decision || !RESPONSE_WINDOW_TYPES.has(decision.type)) return null

    if (option.choiceId === 'pass') {
        return {
            normalImage: passImage,
            activeImage: passActiveImage,
            accessibleLabel: option.label
        }
    }

    if ((decision.type === 'challenge' || decision.type === 'block_challenge') && option.choiceId === 'challenge') {
        return {
            normalImage: challengeImage,
            activeImage: challengeActiveImage,
            accessibleLabel: option.label
        }
    }

    if (decision.type !== 'block') return null

    if (option.choiceId === 'block:duke') {
        return {
            normalImage: blockForeignAidImage,
            activeImage: blockForeignAidActiveImage,
            accessibleLabel: `Block Foreign Aid — ${option.label}`
        }
    }

    if (option.choiceId === 'block:contessa') {
        return {
            normalImage: blockAssassinationImage,
            activeImage: blockAssassinationActiveImage,
            accessibleLabel: `Block Assassination — ${option.label}`
        }
    }

    if (option.choiceId === 'block:captain' || option.choiceId === 'block:ambassador') {
        return {
            normalImage: blockStealImage,
            activeImage: blockStealActiveImage,
            accessibleLabel: `Block Steal — ${option.label}`,
            supplementalLabel: option.label
        }
    }

    return null
}

export default class Coup extends Component {
    constructor(props) {
        super(props)
        this.state = {
            players: [],
            ownInfluences: [],
            currentPlayer: '',
            decision: null,
            submitted: false,
            decisionError: '',
            pausedCause: '',
            canResume: false,
            winner: '',
            canPlayAgain: false,
            logs: [],
            disconnected: false,
            codexDisabled: Boolean(props.codexDisabled)
        }

        const socket = this.props.socket
        socket.on('disconnect', () => this.setState({ disconnected: true }))
        socket.on('g-updatePlayers', snapshot => {
            if (!snapshot || !Array.isArray(snapshot.players)) return
            this.setState({
                players: snapshot.players,
                ownInfluences: Array.isArray(snapshot.ownInfluences) ? snapshot.ownInfluences : [],
                currentPlayer: snapshot.currentPlayer || this.state.currentPlayer
            })
        })
        socket.on('g-updateCurrentPlayer', currentPlayer => this.setState({ currentPlayer }))
        socket.on('g-addLog', message => this.setState(state => ({ logs: state.logs.concat(String(message)) })))
        socket.on('g-decision', decision => this.setState({
            decision,
            submitted: false,
            decisionError: '',
            pausedCause: '',
            canResume: false
        }))
        socket.on('g-decisionClosed', closed => {
            if (this.state.decision && closed.decisionId === this.state.decision.decisionId) {
                this.setState({ decision: null, submitted: false })
            }
        })
        socket.on('g-decisionAccepted', accepted => {
            if (this.state.decision && accepted.decisionId === this.state.decision.decisionId) {
                this.setState({ submitted: true, decisionError: '' })
            }
        })
        socket.on('g-decisionRejected', rejection => this.setState({
            submitted: false,
            decisionError: rejection && rejection.reason ? rejection.reason : 'Decision was rejected.'
        }))
        socket.on('g-gamePaused', paused => this.setState({
            decision: null,
            submitted: false,
            pausedCause: paused && paused.cause ? paused.cause : 'Game paused.',
            canResume: Boolean(paused && paused.canResume)
        }))
        socket.on('g-gameResumed', () => this.setState({ pausedCause: '', canResume: false }))
        socket.on('g-gameOver', winner => this.setState({ winner: `${winner} wins!`, decision: null }))
        socket.on('g-canPlayAgain', () => this.setState({ canPlayAgain: true }))
        socket.on('startRejected', reason => this.setState({ decisionError: `Unable to start: ${reason}` }))
        socket.on('codexDisabled', status => this.setState({
            codexDisabled: Boolean(status && status.disabled)
        }))
    }

    submitChoice = option => {
        const { decision, submitted } = this.state
        if (!decision || submitted) return
        this.props.socket.emit('g-submitDecision', {
            decisionId: decision.decisionId,
            stateVersion: decision.stateVersion,
            choiceId: option.choiceId
        })
        this.setState({ submitted: true, decisionError: '' })
    }

    playAgain = () => {
        if (this.state.canPlayAgain && this.props.isLeader) {
            this.setState({ canPlayAgain: false, winner: '' })
            this.props.socket.emit('g-playAgain')
        }
    }

    resumeGame = () => {
        if (this.state.canResume && this.props.isLeader) this.props.socket.emit('g-resume')
    }

    emergencyStopCodex = () => {
        this.props.socket.emit('emergencyStopCodex')
    }

    render() {
        const me = this.state.players.find(player => player.name === this.props.name)
        const decision = this.state.decision
        const ownInfluences = this.state.ownInfluences
        let playAgain = null
        if (this.state.winner && this.state.canPlayAgain && this.props.isLeader) {
            playAgain = <button className="startGameButton" onClick={this.playAgain}>Play Again</button>
        }

        if (this.state.disconnected) {
            return <div className="GameContainer">
                <div className="GameHeader"><p>You are: {this.props.name}</p></div>
                <p>You have been disconnected. Please recreate the game.</p>
            </div>
        }

        return <div className="GameContainer">
            <div className="GameHeader">
                <div className="PlayerInfo">
                    <p>You are: {this.props.name}{this.props.isSpectator ? ' (spectator)' : ''}</p>
                    {!this.props.isSpectator && <p>Coins: {me ? me.money : 0}</p>}
                </div>
                <div className="CurrentPlayer">
                    {this.state.currentPlayer && <p>It is <b>{this.state.currentPlayer}</b>'s turn</p>}
                </div>
                <RulesModal />
                <CheatSheetModal />
                <EventLog logs={this.state.logs} />
            </div>

            {ownInfluences.length > 0 && <div className="InfluenceSection">
                <p>Your influences</p>
                {ownInfluences.map((influence, index) => <div key={`${influence}-${index}`} className="InfluenceUnitContainer">
                    <span className="circle" style={{ backgroundColor: INFLUENCE_COLORS[influence] }} />
                    <br />
                    <h3>{influence}</h3>
                </div>)}
            </div>}

            <PlayerBoard
                players={this.state.players}
                observerName={this.props.name}
                observerInfluences={ownInfluences}
                currentPlayer={this.state.currentPlayer}
            />
            <ReferencePanel />

            <div className="DecisionsSection" aria-live="polite">
                {this.props.isCodexAuthorized && <button
                    type="button"
                    onClick={this.emergencyStopCodex}
                    disabled={this.state.codexDisabled}
                    style={{ backgroundColor: '#b00020', color: 'white', fontWeight: 'bold', marginBottom: 12 }}
                >{this.state.codexDisabled ? 'CODEX APAGADO' : 'APAGAR CODEX · EMERGENCIA'}</button>}
                {this.state.pausedCause && <p role="alert">Game paused: {this.state.pausedCause}</p>}
                {this.state.canResume && this.props.isLeader && <button onClick={this.resumeGame}>Resume game</button>}
                {decision && <>
                    <p className="DecisionTitle">{decision.title}</p>
                    <p>{decision.description}</p>
                    {(decision.type === 'challenge' || decision.type === 'block_challenge') &&
                        <img className="DecisionClaimContext" src={claimImage} alt="" aria-hidden="true" />}
                    <div className="DecisionButtonsContainer">
                        {decision.options.map(option => {
                            const imageButton = responseButtonFor(decision, option)
                            const disabled = this.state.submitted || Boolean(this.state.pausedCause)
                            const onClick = () => this.submitChoice(option)

                            if (imageButton) {
                                return <ResponseImageButton
                                    key={option.choiceId}
                                    {...imageButton}
                                    disabled={disabled}
                                    onClick={onClick}
                                />
                            }

                            return <button
                                key={option.choiceId}
                                type="button"
                                disabled={disabled}
                                onClick={onClick}
                            >{option.label}</button>
                        })}
                    </div>
                    {this.state.submitted && <p>Decision sent. Waiting for the other players.</p>}
                    {this.state.decisionError && <p role="alert">{this.state.decisionError}</p>}
                </>}
                {!decision && !this.state.winner && !this.state.pausedCause && <p>Waiting for other players...</p>}
                {this.state.winner && <p><b>{this.state.winner}</b></p>}
                {playAgain}
            </div>
        </div>
    }
}
