import React, { Component } from 'react'
import PlayerBoard from './PlayerBoard'
import './CoupStyles.css'
import EventLog from './EventLog'
import CheatSheetModal from '../CheatSheetModal'
import RulesModal from '../RulesModal'
import ReferencePanel from './ReferencePanel'
import { t } from '../../i18n'
import { lobbyError } from '../../i18n/lobby'
import ResponseImageButton from './ResponseImageButton'
import blockAssassinationImage from '../../assets/action-buttons/ba.webp'
import blockAssassinationActiveImage from '../../assets/action-buttons/ba-active.webp'
import blockForeignAidImage from '../../assets/action-buttons/bfa.webp'
import blockForeignAidActiveImage from '../../assets/action-buttons/bfa-active.webp'
import blockStealImage from '../../assets/action-buttons/bs.webp'
import blockStealActiveImage from '../../assets/action-buttons/bs-active.webp'
import challengeImage from '../../assets/action-buttons/c.webp'
import challengeActiveImage from '../../assets/action-buttons/c-active.webp'
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

function responseButtonFor(decision, option, localizedLabel) {
    if (!decision || !RESPONSE_WINDOW_TYPES.has(decision.type)) return null

    if (option.choiceId === 'pass') {
        return {
            normalImage: passImage,
            activeImage: passActiveImage,
            accessibleLabel: localizedLabel
        }
    }

    if ((decision.type === 'challenge' || decision.type === 'block_challenge') && option.choiceId === 'challenge') {
        return {
            normalImage: challengeImage,
            activeImage: challengeActiveImage,
            accessibleLabel: localizedLabel
        }
    }

    if (decision.type !== 'block') return null

    if (option.choiceId === 'block:duke') {
        return {
            normalImage: blockForeignAidImage,
            activeImage: blockForeignAidActiveImage,
            accessibleLabel: localizedLabel
        }
    }

    if (option.choiceId === 'block:contessa') {
        return {
            normalImage: blockAssassinationImage,
            activeImage: blockAssassinationActiveImage,
            accessibleLabel: localizedLabel
        }
    }

    if (option.choiceId === 'block:captain' || option.choiceId === 'block:ambassador') {
        return {
            normalImage: blockStealImage,
            activeImage: blockStealActiveImage,
            accessibleLabel: localizedLabel,
            supplementalLabel: localizedLabel
        }
    }

    return null
}

const ACTION_KEYS = {
    income: 'income',
    foreign_aid: 'foreignAid',
    coup: 'coup',
    tax: 'tax',
    assassinate: 'assassinate',
    exchange: 'exchange',
    steal: 'steal'
}

const ROLE_KEYS = {
    duke: 'duke',
    captain: 'captain',
    assassin: 'assassin',
    contessa: 'contessa',
    ambassador: 'ambassador'
}

const DECISION_TITLE_KEYS = {
    action: 'game.decision.title.action',
    challenge: 'game.decision.title.challenge',
    block: 'game.decision.title.block',
    block_challenge: 'game.decision.title.challenge',
    prove_claim: 'game.decision.title.prove',
    lose_influence: 'game.decision.title.loseInfluence',
    exchange: 'game.decision.title.exchange'
}

function roleName(role) {
    const key = ROLE_KEYS[String(role || '').toLowerCase()]
    return key ? t(`game.roles.${key}`) : t('game.roles.unknown')
}

function actionName(action) {
    const normalized = String(action || '').toLowerCase().replace(/\s+/g, '_')
    const key = ACTION_KEYS[normalized]
    return key ? t(`game.actions.${key}.label`) : t('game.actions.unknown')
}

function decisionDescription(decision, currentPlayer, ownInfluenceCount) {
    if (!decision) return ''
    if (decision.type === 'action') {
        const match = decision.description.match(/^(.+), choose your action\.$/)
        return t('game.decision.description.action', { playerName: match ? match[1] : currentPlayer })
    }
    if (decision.type === 'challenge') {
        const match = decision.description.match(/^(.+) claims (.+) for (.+)\.$/)
        return match
            ? t('game.decision.description.challenge', { playerName: match[1], roleLabel: roleName(match[2]), actionLabel: actionName(match[3]) })
            : t('game.decision.description.generic')
    }
    if (decision.type === 'block') {
        const foreignAid = decision.description.match(/^(.+) takes foreign aid;/)
        if (foreignAid) return t('game.decision.description.blockForeignAid', { playerName: foreignAid[1], roleLabel: roleName('duke') })
        const match = decision.description.match(/^(.+) may block (.+)\.$/)
        return match
            ? t('game.decision.description.block', { playerName: match[1], actionLabel: actionName(match[2]) })
            : t('game.decision.description.generic')
    }
    if (decision.type === 'block_challenge') {
        const match = decision.description.match(/^(.+) claims (.+) to block\.$/)
        return match
            ? t('game.decision.description.blockChallenge', { playerName: match[1], roleLabel: roleName(match[2]) })
            : t('game.decision.description.generic')
    }
    if (decision.type === 'prove_claim') {
        const blockMatch = decision.description.match(/^(.+) must prove the blocking claim\.$/)
        if (blockMatch) return t('game.decision.description.proveBlock', { playerName: blockMatch[1] })
        const match = decision.description.match(/^(.+) must prove the (.+) claim\.$/)
        return match
            ? t('game.decision.description.proveClaim', { playerName: match[1], roleLabel: roleName(match[2]) })
            : t('game.decision.description.generic')
    }
    if (decision.type === 'lose_influence') return t('game.decision.description.loseInfluence')
    if (decision.type === 'exchange') return t('game.decision.description.exchange', { count: ownInfluenceCount })
    return t('game.decision.description.generic')
}

function actionOptionLabel(action) {
    const key = ACTION_KEYS[action]
    return key ? t(`game.decision.action.option.${key}`) : t('game.decision.option.unknown')
}

function localizeOptionLabel(option, decision) {
    const choiceId = String(option.choiceId || '')
    if (choiceId === 'pass') return t('game.common.pass')
    if (choiceId === 'challenge') return t('game.challenge.button')
    if (decision.type === 'action') {
        const targetSeparator = ' — '
        const action = choiceId.split(':')[0]
        if (choiceId.includes(':')) {
            const englishAction = ({ coup: 'Coup', steal: 'Steal', assassinate: 'Assassinate' })[action]
            const prefix = `${englishAction}${targetSeparator}`
            const targetName = option.label.startsWith(prefix) ? option.label.slice(prefix.length) : ''
            return t('game.decision.action.target', { actionLabel: actionName(action), targetName })
        }
        return actionOptionLabel(action)
    }
    if (choiceId.startsWith('block:')) return t('game.decision.option.block', { roleLabel: roleName(choiceId.slice(6)) })
    if (choiceId.startsWith('prove:')) return t('game.decision.option.prove', { roleLabel: roleName(choiceId.split(':')[1]) })
    if (choiceId === 'concede') return t('game.decision.option.concede')
    if (choiceId.startsWith('lose:')) {
        const match = option.label.match(/^Reveal and lose (.+)$/)
        return t('game.decision.option.lose', { roleLabel: roleName(match && match[1]) })
    }
    if (choiceId.startsWith('exchange:')) {
        const roles = option.label.replace(/^Keep /, '').split(' and ').map(roleName)
        return t('game.decision.option.keep', { roles: roles.join(' y ') })
    }
    return t('game.decision.option.unknown')
}

function pausedMessage(cause) {
    const message = String(cause || '')
    let match = message.match(/^(.+) disconnected before the game started\.$/)
    if (match) return t('game.pause.disconnectedBeforeStart', { playerName: match[1] })
    match = message.match(/^(.+) disconnected; recreate the game to continue\.$/)
    if (match) return t('game.pause.disconnected', { playerName: match[1] })
    match = message.match(/^(.+) decision timed out\.$/)
    if (match) return t('game.pause.decisionTimeout', { decisionType: t(`game.decision.type.${match[1]}`) })
    const known = {
        'Game paused.': 'game.pause.generic',
        'Codex is disabled or unavailable. Re-enable it from the server before resuming or recreating the game.': 'game.pause.codexUnavailable',
        'Codex returned a stale or invalid decision.': 'game.pause.codexStale',
        'Codex returned an unavailable choice.': 'game.pause.codexChoiceUnavailable',
        'Codex could not complete this decision. Check its login, usage limit, and runner, then resume or recreate the game.': 'game.pause.codexFailed',
        'Codex was disabled by a player. The owner must re-enable it on the server before starting a new AI decision.': 'game.pause.codexDisabled',
        'Codex was disabled by a player.': 'game.pause.codexDisabledShort',
        'The active player did not choose an action.': 'game.pause.actionMissing',
        'Claimant did not resolve the challenge.': 'game.pause.challengeMissing',
        'Influence loss was not resolved.': 'game.pause.influenceMissing',
        'Influence changed during a loss decision.': 'game.pause.influenceChanged',
        'Exchange was not resolved.': 'game.pause.exchangeMissing',
        'No active player remains.': 'game.pause.noActivePlayer'
    }
    return t(known[message] || 'game.pause.generic')
}

const DECISION_ERROR_KEYS = {
    'This socket does not control a player seat.': 'game.decision.error.notPlayer',
    'Expected decisionId, stateVersion, and choiceId only.': 'game.decision.error.invalidEnvelope',
    'There is no active decision.': 'game.decision.error.noActiveDecision',
    'Decision is stale or belongs to another phase.': 'game.decision.error.stale',
    'This seat is not eligible for this decision.': 'game.decision.error.ineligible',
    'Choice is not available to this seat.': 'game.decision.error.choiceUnavailable',
    'A different choice was already submitted.': 'game.decision.error.alreadySubmitted',
    'Only the lobby leader can resume a timed-out decision.': 'game.decision.error.leaderOnlyResume',
    'There is no timed-out decision to resume.': 'game.decision.error.noTimedOutDecision',
    'This pause cannot be resumed; recreate the game.': 'game.decision.error.cannotResume',
    'Every seat must still be connected to resume.': 'game.decision.error.seatsDisconnected',
    'Only the current lobby leader can restart after game over.': 'game.decision.error.leaderOnlyRestart'
}

function decisionError(reason) {
    return t(DECISION_ERROR_KEYS[reason] || 'game.decision.rejected')
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
            decisionError: decisionError(rejection && rejection.reason ? rejection.reason : '')
        }))
        socket.on('g-gamePaused', paused => this.setState({
            decision: null,
            submitted: false,
            pausedCause: paused && paused.cause ? paused.cause : 'Game paused.',
            canResume: Boolean(paused && paused.canResume)
        }))
        socket.on('g-gameResumed', () => this.setState({ pausedCause: '', canResume: false }))
        socket.on('g-gameOver', winner => this.setState({ winner: String(winner || ''), decision: null }))
        socket.on('g-canPlayAgain', () => this.setState({ canPlayAgain: true }))
        socket.on('startRejected', reason => this.setState({ decisionError: t('lobby.error.startRejected', { reason: lobbyError(reason) }) }))
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
            playAgain = <button className="startGameButton" onClick={this.playAgain}>{t('game.playAgain')}</button>
        }

        if (this.state.disconnected) {
            return <div className="GameContainer">
                <div className="GameHeader"><p>{t('game.player.identity', { playerName: this.props.name })}</p></div>
                <p>{t('game.disconnect.notice')} {t('game.disconnect.recreate')}</p>
            </div>
        }

        return <div className="GameContainer">
            <div className="GameHeader">
                <div className="PlayerInfo">
                    <p>{t('game.player.identity', { playerName: this.props.name })}{this.props.isSpectator ? ` ${t('game.spectator')}` : ''}</p>
                    {!this.props.isSpectator && <p>{t('game.player.coins', { coins: me ? me.money : 0 })}</p>}
                </div>
                <div className="CurrentPlayer">
                    {this.state.currentPlayer && <p>{t('game.turn.current', { playerName: this.state.currentPlayer })}</p>}
                </div>
                <RulesModal />
                <CheatSheetModal />
                <EventLog logs={this.state.logs} />
            </div>

            {ownInfluences.length > 0 && <div className="InfluenceSection">
                <p>{t('game.player.influences')}</p>
                {ownInfluences.map((influence, index) => <div key={`${influence}-${index}`} className="InfluenceUnitContainer">
                    <span className="circle" style={{ backgroundColor: INFLUENCE_COLORS[influence] }} />
                    <br />
                    <h3>{roleName(influence)}</h3>
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
                >{this.state.codexDisabled ? t('lobby.ai.emergency.disabled') : t('lobby.ai.emergency.stop')}</button>}
                {this.state.pausedCause && <p role="alert">{t('game.paused.prefix', { cause: pausedMessage(this.state.pausedCause) })}</p>}
                {this.state.canResume && this.props.isLeader && <button onClick={this.resumeGame}>{t('game.resume')}</button>}
                {decision && <>
                    <p className="DecisionTitle">{t(DECISION_TITLE_KEYS[decision.type] || 'game.decision.title.generic', {
                        count: ownInfluences.length,
                        influenceLabel: ownInfluences.length === 1 ? t('game.influence.singular') : t('game.influence.plural')
                    })}</p>
                    <p>{decisionDescription(decision, this.state.currentPlayer, ownInfluences.length)}</p>
                    <div className="DecisionButtonsContainer">
                        {decision.options.map(option => {
                            const optionLabel = localizeOptionLabel(option, decision)
                            const imageButton = responseButtonFor(decision, option, optionLabel)
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
                            >{optionLabel}</button>
                        })}
                    </div>
                    {this.state.submitted && <p>{t('game.decision.sent')}</p>}
                    {this.state.decisionError && <p role="alert">{this.state.decisionError}</p>}
                </>}
                {!decision && !this.state.winner && !this.state.pausedCause && <p>{t('game.waiting')}</p>}
                {this.state.winner && <p><b>{t('game.result.winner', { playerName: this.state.winner })}</b></p>}
                {playAgain}
            </div>
        </div>
    }
}
