import React, { Component, createRef } from 'react'
import { createPortal } from 'react-dom'
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

const RESPONSE_WINDOW_TYPES = new Set(['challenge', 'block', 'block_challenge'])

function responseButtonFor(decision, option, localizedLabel) {
    if (!decision || !RESPONSE_WINDOW_TYPES.has(decision.type)) return null

    if (option.choiceId === 'pass') {
        return {
            normalImage: passImage,
            activeImage: passActiveImage,
            accessibleLabel: localizedLabel,
            imageLabel: t('game.common.pass'),
            imageLabelStyle: 'pass'
        }
    }

    if ((decision.type === 'challenge' || decision.type === 'block_challenge') && option.choiceId === 'challenge') {
        return {
            normalImage: challengeImage,
            activeImage: challengeActiveImage,
            accessibleLabel: localizedLabel,
            imageLabel: t('game.challenge.button'),
            imageLabelStyle: 'challenge'
        }
    }

    if (decision.type !== 'block') return null

    if (option.choiceId === 'block:duke') {
        return {
            normalImage: blockForeignAidImage,
            activeImage: blockForeignAidActiveImage,
            accessibleLabel: localizedLabel,
            imageLabel: t('game.block.foreignAid.button'),
            imageLabelStyle: 'blockForeignAid'
        }
    }

    if (option.choiceId === 'block:contessa') {
        return {
            normalImage: blockAssassinationImage,
            activeImage: blockAssassinationActiveImage,
            accessibleLabel: localizedLabel,
            imageLabel: t('game.block.assassination.button'),
            imageLabelStyle: 'blockAssassination'
        }
    }

    if (option.choiceId === 'block:captain' || option.choiceId === 'block:ambassador') {
        return {
            normalImage: blockStealImage,
            activeImage: blockStealActiveImage,
            accessibleLabel: localizedLabel,
            supplementalLabel: localizedLabel,
            imageLabel: t('game.block.steal.button'),
            imageLabelStyle: 'blockSteal'
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

const ACTION_ROWS = [
    { action: 'income', blockers: [], reward: 1 },
    { action: 'foreign_aid', blockers: ['duke'], reward: 2 },
    { action: 'coup', blockers: [], cost: 7, target: true },
    { action: 'tax', declaredRole: 'duke', blockers: [], reward: 3 },
    { action: 'assassinate', declaredRole: 'assassin', blockers: ['contessa'], cost: 3, target: true },
    { action: 'exchange', declaredRole: 'ambassador', blockers: [], free: true },
    { action: 'steal', declaredRole: 'captain', blockers: ['ambassador', 'captain'], amount: 2, target: true }
]

const ACTION_ROW_KEYS = new Set(ACTION_ROWS.map(({ action }) => action))

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

function actionOptionGroups(options) {
    const groups = new Map(ACTION_ROWS.map(({ action }) => [action, []]))
    options.forEach(option => {
        const action = String(option.choiceId || '').split(':')[0]
        if (ACTION_ROW_KEYS.has(action)) groups.get(action).push(option)
    })
    return groups
}

function unavailableActionReason(action, options, money) {
    if (options.length > 0) return ''
    if (money >= 10 && action !== 'coup') return t('game.actions.error.coupRequired')

    const cost = action === 'coup' ? 7 : action === 'assassinate' ? 3 : null
    if (cost !== null && money < cost) {
        return t('game.actions.error.insufficientFundsAction', { cost, actionLabel: actionName(action) })
    }

    return t('game.actions.error.unavailable')
}

function actionPrice(actionRow) {
    if (actionRow.free) return t('game.actions.price.free')
    if (actionRow.cost !== undefined) return t('game.actions.price.cost', { cost: actionRow.cost })
    if (actionRow.reward !== undefined) {
        return actionRow.reward === 1
            ? t('game.actions.price.reward.single')
            : t('game.actions.price.reward.plural', { amount: actionRow.reward })
    }
    if (actionRow.amount !== undefined) return t('game.actions.price.amount', { amount: actionRow.amount })
    return ''
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

function targetName(option, action) {
    const actionEnglish = ({ coup: 'Coup', steal: 'Steal', assassinate: 'Assassinate' })[action]
    const label = String(option.label || '')
    const prefix = `${actionEnglish} — `
    return actionEnglish && label.startsWith(prefix) ? label.slice(prefix.length) : label
}

const DECISION_ERROR_KEYS = {
    'This socket does not control a player seat.': 'game.decision.error.notPlayer',
    'Expected decisionId, stateVersion, and choiceId only.': 'game.decision.error.invalidEnvelope',
    'There is no active decision.': 'game.decision.error.noActiveDecision',
    'Decision is stale or belongs to another phase.': 'game.decision.error.stale',
    'This seat is not eligible for this decision.': 'game.decision.error.ineligible',
    'Choice is not available to this seat.': 'game.decision.error.choiceUnavailable',
    'A different choice was already submitted.': 'game.decision.error.alreadySubmitted',
    'Only a player who did not answer this decision can resume it.': 'game.decision.error.timeoutOwnerOnlyResume',
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
            courtCount: null,
            currentPlayer: '',
            decision: null,
            actionTarget: null,
            submitted: false,
            decisionError: '',
            gamePaused: false,
            canResume: false,
            resumePending: false,
            pauseWaiting: false,
            winner: '',
            canPlayAgain: false,
            logs: [],
            disconnected: false,
            codexDisabled: Boolean(props.codexDisabled)
        }
        this.pauseOverlayRef = createRef()
        this.decisionSectionRef = createRef()
        this.resumeRequestPending = false
        this.pauseReturnFocus = null
        this.actionSubmissionLock = false
        this.actionRowRefs = Object.fromEntries(ACTION_ROWS.map(({ action }) => [action, React.createRef()]))
        this.firstActionTargetRef = React.createRef()

        const socket = this.props.socket
        socket.on('disconnect', () => this.setState({ disconnected: true }))
        socket.on('g-updatePlayers', snapshot => {
            if (!snapshot || !Array.isArray(snapshot.players)) return
            this.setState({
                players: snapshot.players,
                ownInfluences: Array.isArray(snapshot.ownInfluences) ? snapshot.ownInfluences : [],
                courtCount: Number.isFinite(snapshot.courtCount) ? snapshot.courtCount : null,
                currentPlayer: snapshot.currentPlayer || this.state.currentPlayer
            })
        })
        socket.on('g-updateCurrentPlayer', currentPlayer => this.setState({ currentPlayer }))
        socket.on('g-addLog', message => this.setState(state => ({ logs: state.logs.concat(String(message)) })))
        socket.on('g-decision', decision => {
            this.actionSubmissionLock = false
            this.setState(state => ({
                decision,
                actionTarget: null,
                submitted: false,
                decisionError: state.gamePaused ? state.decisionError : ''
            }))
        })
        socket.on('g-decisionClosed', closed => {
            if (this.state.decision && closed.decisionId === this.state.decision.decisionId) {
                this.actionSubmissionLock = false
                this.setState({ decision: null, actionTarget: null, submitted: false })
            }
        })
        socket.on('g-decisionAccepted', accepted => {
            if (this.state.decision && accepted.decisionId === this.state.decision.decisionId) {
                this.setState({ submitted: true, decisionError: '' })
            }
        })
        socket.on('g-decisionRejected', rejection => {
            this.actionSubmissionLock = false
            const rejectedResume = this.state.gamePaused
            if (rejectedResume) this.resumeRequestPending = false
            this.setState(state => ({
                submitted: false,
                decisionError: decisionError(rejection && rejection.reason ? rejection.reason : ''),
                resumePending: rejectedResume ? false : state.resumePending
            }))
        })
        socket.on('g-gamePaused', paused => {
            this.actionSubmissionLock = false
            const showOverlay = !paused || paused.showOverlay !== false
            if (showOverlay && !this.state.gamePaused && typeof document !== 'undefined') {
                this.pauseReturnFocus = document.activeElement
            }
            this.resumeRequestPending = false
            this.setState({
                decision: null,
                actionTarget: null,
                submitted: false,
                gamePaused: showOverlay,
                canResume: showOverlay && Boolean(paused && paused.canResume),
                resumePending: false,
                pauseWaiting: Boolean(paused && paused.waitingForOwner),
                decisionError: ''
            }, () => {
                if (showOverlay && this.pauseOverlayRef.current) this.pauseOverlayRef.current.focus({ preventScroll: true })
            })
        })
        socket.on('g-gameResumed', () => {
            this.resumeRequestPending = false
            this.setState({
                gamePaused: false,
                canResume: false,
                resumePending: false,
                pauseWaiting: false,
                decisionError: ''
            }, () => {
                if (typeof document === 'undefined') return
                const returnFocus = this.pauseReturnFocus
                this.pauseReturnFocus = null
                if (returnFocus && returnFocus !== document.body && document.contains(returnFocus)) {
                    returnFocus.focus({ preventScroll: true })
                } else if (this.decisionSectionRef.current) {
                    this.decisionSectionRef.current.focus({ preventScroll: true })
                }
            })
        })
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

    submitActionChoice = option => {
        const { decision, submitted } = this.state
        if (this.actionSubmissionLock || !decision || decision.type !== 'action' || submitted) return
        if (!Array.isArray(decision.options) || !decision.options.includes(option)) return
        this.actionSubmissionLock = true
        this.submitChoice(option)
    }

    openActionTargets = action => {
        const decision = this.state.decision
        if (!decision || decision.type !== 'action' || this.state.submitted || this.actionSubmissionLock) return
        const options = actionOptionGroups(Array.isArray(decision.options) ? decision.options : []).get(action) || []
        if (options.length === 0) return
        this.setState({ actionTarget: action, decisionError: '' }, () => {
            if (this.firstActionTargetRef.current) this.firstActionTargetRef.current.focus()
        })
    }

    cancelActionTargets = () => {
        const action = this.state.actionTarget
        if (!action || this.state.submitted) return
        this.setState({ actionTarget: null }, () => {
            const actionRow = this.actionRowRefs[action]
            if (actionRow && actionRow.current) actionRow.current.focus()
        })
    }

    handleActionDecisionKeyDown = event => {
        if (event.key === 'Escape' && this.state.actionTarget && !this.state.submitted) {
            event.preventDefault()
            this.cancelActionTargets()
        }
    }

    renderActionDecision(decision, money) {
        const optionsByAction = actionOptionGroups(Array.isArray(decision.options) ? decision.options : [])
        const targetAction = this.state.actionTarget
        const submitted = this.state.submitted || this.state.gamePaused
        const selectedTargets = targetAction ? (optionsByAction.get(targetAction) || []) : []
        const selectedActionRow = ACTION_ROWS.find(({ action }) => action === targetAction)

        return <section className="ActionDecision DecisionActionPanel" onKeyDown={this.handleActionDecisionKeyDown} aria-labelledby="action-decision-title">
            <h2 id="action-decision-title" className="ActionDecisionTitle">
                {targetAction ? t('game.actions.chooseTarget') : t('game.actions.turnTitle')}
            </h2>
            {targetAction
                ? <p className="DecisionActionPrompt">{selectedActionRow ? t(`game.actions.${ACTION_KEYS[targetAction]}.description`) : ''}</p>
                : <p className="DecisionActionPrompt">{decisionDescription(decision, this.state.currentPlayer, this.state.ownInfluences.length)}</p>}

            {targetAction ? <>
                <div className="DecisionActionTargets" role="group" aria-label={t('game.actions.chooseTarget')}>
                    {selectedTargets.map((option, index) => <button
                        className="DecisionActionTarget"
                        key={option.choiceId}
                        type="button"
                        ref={index === 0 ? this.firstActionTargetRef : null}
                        disabled={submitted}
                        aria-label={localizeOptionLabel(option, decision)}
                        onClick={() => this.submitActionChoice(option)}
                    >{targetName(option, targetAction)}</button>)}
                </div>
                <button
                    className="DecisionActionCancel"
                    type="button"
                    disabled={submitted}
                    onClick={this.cancelActionTargets}
                >{t('game.actions.cancel')}</button>
            </> : <div className="DecisionActionRows" role="group" aria-label={t('game.actions.turnTitle')}>
                {ACTION_ROWS.map((actionRow, index) => {
                    const { action, blockers, declaredRole } = actionRow
                    const options = optionsByAction.get(action) || []
                    const nextActionRow = ACTION_ROWS[index + 1]
                    const nextOptions = nextActionRow ? (optionsByAction.get(nextActionRow.action) || []) : []
                    const available = options.length > 0
                    const showDivider = available && nextOptions.length > 0
                    const unavailableReason = unavailableActionReason(action, options, money)
                    const actionId = `decision-action-${action}`
                    const actionPriceLabel = actionPrice(actionRow)
                    const isTargetAction = Boolean(actionRow.target)
                    const content = <>
                        <span className="DecisionActionContent">
                            <span className="DecisionActionHeading">
                                <span id={`${actionId}-label`} className="DecisionActionLabel">{actionName(action)}</span>
                                {declaredRole && <span className={`ActionRoleChip ActionRoleChip--declared ActionRoleChip--${declaredRole}`}>{roleName(declaredRole)}</span>}
                            </span>
                            <span id={`${actionId}-description`} className="DecisionActionDescription">{t(`game.actions.${ACTION_KEYS[action]}.description`)}</span>
                            {blockers.length > 0 && <span id={`${actionId}-roles`} className="DecisionActionMeta">
                                <span className="ActionMetaLabel">{t('game.actions.blockedBy')}</span>
                                {blockers.map(role => <span className={`ActionRoleChip ActionRoleChip--blocker ActionRoleChip--${role}`} key={role}>{roleName(role)}</span>)}
                            </span>}
                            {declaredRole && blockers.length === 0 && <span id={`${actionId}-roles`} className="DecisionActionMeta DecisionActionMeta--unblockable">{t('game.actions.unblockable')}</span>}
                            {!available && <span id={`${actionId}-hint`} className="DecisionActionHint" role="note">{unavailableReason}</span>}
                        </span>
                        <span id={`${actionId}-price`} className={`ActionPrice${actionRow.free ? ' ActionPrice--free' : ''}`} aria-label={actionPriceLabel}>
                            {actionRow.free
                                ? actionPriceLabel
                                : <span className="ActionPriceAmount">{actionRow.cost !== undefined ? actionRow.cost : actionRow.reward !== undefined ? `+${actionRow.reward}` : actionRow.amount}<span className="ActionCoin" aria-hidden="true">⚜</span></span>}
                        </span>
                    </>

                    const actionRowElement = <div className="DecisionActionEntry" key={action}>
                        <button
                            className={`DecisionActionRow${available ? '' : ' DecisionActionRow--disabled'}`}
                            type="button"
                            ref={this.actionRowRefs[action]}
                            aria-labelledby={`${actionId}-label`}
                            aria-describedby={`${actionId}-description ${actionId}-price${declaredRole || blockers.length ? ` ${actionId}-roles` : ''}${available ? '' : ` ${actionId}-hint`}`}
                            aria-disabled={available ? undefined : 'true'}
                            disabled={available && submitted}
                            onClick={available ? (isTargetAction
                                ? () => this.openActionTargets(action)
                                : () => this.submitActionChoice(options[0])) : undefined}
                        >{content}</button>
                        {showDivider && <span className="DecisionActionDivider" aria-hidden="true" />}
                    </div>
                    return available ? actionRowElement : null
                })}
            </div>}
            {this.state.submitted && <p>{t('game.decision.sent')}</p>}
            {this.state.decisionError && <p className="ActionError" role="alert">{this.state.decisionError}</p>}
        </section>
    }

    playAgain = () => {
        if (this.state.canPlayAgain && this.props.isLeader) {
            this.setState({ canPlayAgain: false, winner: '' })
            this.props.socket.emit('g-playAgain')
        }
    }

    resumeGame = () => {
        if (!this.state.canResume || this.resumeRequestPending) return
        this.resumeRequestPending = true
        this.setState({ resumePending: true, decisionError: '' }, () => {
            this.props.socket.emit('g-resume')
        })
    }

    trapPauseFocus = event => {
        if (event.key !== 'Tab') return
        const dialog = event.currentTarget
        const focusable = Array.from(dialog.querySelectorAll(
            'button:not(:disabled):not([aria-disabled="true"]), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        ))
        if (!focusable.length) {
            event.preventDefault()
            dialog.focus()
            return
        }

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (event.shiftKey && (active === first || active === dialog)) {
            event.preventDefault()
            last.focus()
        } else if (!event.shiftKey && (active === last || active === dialog)) {
            event.preventDefault()
            first.focus()
        }
    }

    emergencyStopCodex = () => {
        this.props.socket.emit('emergencyStopCodex')
    }

    render() {
        const me = this.state.players.find(player => player.name === this.props.name)
        const decision = this.state.decision
        const actionDecision = decision && decision.type === 'action'
        const ownInfluences = this.state.ownInfluences
        const responseWindowOpen = Boolean(
            decision &&
            RESPONSE_WINDOW_TYPES.has(decision.type) &&
            Array.isArray(decision.options) &&
            decision.options.length > 0 &&
            !this.state.gamePaused &&
            !this.props.isSpectator
        )
        const responseAvailable = responseWindowOpen && !this.state.submitted
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

        const actionDecisionRail = actionDecision && typeof document !== 'undefined'
            ? createPortal(<div className="ActionDecisionRail" aria-live="polite">
                <CheatSheetModal />
                {this.renderActionDecision(decision, me && Number.isFinite(me.money) ? me.money : 0)}
            </div>, document.body)
            : null

        return <div className="GameContainer" data-player-count={this.state.players.length}>
            <div className="GameHeader">
                <div className="PlayerInfo">
                    <p>{t('game.player.identity', { playerName: this.props.name })}{this.props.isSpectator ? ` ${t('game.spectator')}` : ''}</p>
                    {!this.props.isSpectator && <p>{t('game.player.coins', { coins: me ? me.money : 0 })}</p>}
                </div>
                <div className="CurrentPlayer">
                    {this.state.currentPlayer && <p>{t('game.turn.current', { playerName: this.state.currentPlayer })}</p>}
                </div>
                <RulesModal />
                {!actionDecision && <CheatSheetModal />}
                <EventLog logs={this.state.logs} />
            </div>

            {actionDecisionRail}

            <PlayerBoard
                players={this.state.players}
                observerName={this.props.name}
                observerInfluences={ownInfluences}
                currentPlayer={this.state.currentPlayer}
                responseWindowOpen={responseWindowOpen}
                responseAvailable={responseAvailable}
                courtCount={this.state.courtCount}
            />
            <ReferencePanel />

            <div ref={this.decisionSectionRef} tabIndex="-1" className="DecisionsSection" aria-live="polite">
                {this.props.isCodexAuthorized && <button
                    type="button"
                    onClick={this.emergencyStopCodex}
                    disabled={this.state.codexDisabled}
                    style={{ backgroundColor: '#b00020', color: 'white', fontWeight: 'bold', marginBottom: 12 }}
                >{this.state.codexDisabled ? t('lobby.ai.emergency.disabled') : t('lobby.ai.emergency.stop')}</button>}
                {decision && decision.type === 'action' && this.renderActionDecision(decision, me && Number.isFinite(me.money) ? me.money : 0)}
                {decision && decision.type !== 'action' && <>
                    <p className="DecisionTitle">{t(DECISION_TITLE_KEYS[decision.type] || 'game.decision.title.generic', {
                        count: ownInfluences.length,
                        influenceLabel: ownInfluences.length === 1 ? t('game.influence.singular') : t('game.influence.plural')
                    })}</p>
                    <p>{decisionDescription(decision, this.state.currentPlayer, ownInfluences.length)}</p>
                    <div className="DecisionButtonsContainer">
                        {decision.options.map(option => {
                            const optionLabel = localizeOptionLabel(option, decision)
                            const imageButton = responseButtonFor(decision, option, optionLabel)
                            const disabled = this.state.submitted || this.state.gamePaused
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
                {this.state.pauseWaiting && <p className="PauseWaitingStatus" role="status">{t('game.pause.generic')}</p>}
                {!decision && !this.state.winner && !this.state.gamePaused && !this.state.pauseWaiting && <p>{t('game.waiting')}</p>}
                {this.state.winner && <p><b>{t('game.result.winner', { playerName: this.state.winner })}</b></p>}
                {playAgain}
            </div>

            {this.state.gamePaused && <div
                ref={this.pauseOverlayRef}
                className="PauseOverlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="PauseOverlayTitle"
                tabIndex="-1"
                onKeyDown={this.trapPauseFocus}
            >
                <section className="PauseDialog">
                    <h2 id="PauseOverlayTitle">{t('game.pause.title')}</h2>
                    {this.state.canResume && <button
                        type="button"
                        className="PauseResumeButton"
                        disabled={this.state.resumePending}
                        aria-disabled={this.state.resumePending}
                        onClick={this.resumeGame}
                    >{t('game.resume')}</button>}
                    {this.state.decisionError && <p className="PauseError" role="alert">{this.state.decisionError}</p>}
                </section>
            </div>}
        </div>
    }
}
