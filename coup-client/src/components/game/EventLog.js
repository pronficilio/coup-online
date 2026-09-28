import React, { Component, createRef } from 'react'
import { t } from '../../i18n'
import './EventLogStyles.css'

const ACTION_TRANSLATION_KEYS = {
    income: 'game.actions.income.label',
    foreign_aid: 'game.actions.foreignAid.label',
    coup: 'game.actions.coup.label',
    tax: 'game.actions.tax.label',
    assassinate: 'game.actions.assassinate.label',
    exchange: 'game.actions.exchange.label',
    steal: 'game.actions.steal.label'
}

const ROLE_TRANSLATION_KEYS = {
    duke: 'game.roles.duke',
    captain: 'game.roles.captain',
    assassin: 'game.roles.assassin',
    contessa: 'game.roles.contessa',
    ambassador: 'game.roles.ambassador'
}

const REACTIONS = {
    like: { emoji: '👍', label: 'game.eventLog.reaction.like' },
    bravo: { emoji: '👏', label: 'game.eventLog.reaction.bravo' },
    laugh: { emoji: '😂', label: 'game.eventLog.reaction.laugh' },
    skeptical: { emoji: '🤨', label: 'game.eventLog.reaction.skeptical' },
    surprise: { emoji: '😮', label: 'game.eventLog.reaction.surprise' },
    thinking: { emoji: '🤔', label: 'game.eventLog.reaction.thinking' },
    dislike: { emoji: '👎', label: 'game.eventLog.reaction.dislike' },
    secret: { emoji: '🤫', label: 'game.eventLog.reaction.secret' }
}

const EVENT_ICONS = {
    action_declared: '🎭',
    action_result: '🪙',
    challenge_started: '⚖️',
    block_declared: '🛡️',
    block_challenge_started: '⚖️',
    claim_proved: '🃏',
    claim_not_proved: '🃏',
    influence_lost: '💔',
    player_eliminated: '🚪'
}

const PLAYER_MARKERS = {
    actorSeat: '\u0001actor\u0001',
    targetSeat: '\u0001target\u0001',
    blockerSeat: '\u0001blocker\u0001',
    challengerSeat: '\u0001challenger\u0001',
    challengeeSeat: '\u0001challengee\u0001'
}

function isMobileViewport() {
    return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(max-width: 720px)').matches
}

function pluralCoinLabel(amount) {
    return t(amount === 1 ? 'game.eventLog.coin.single' : 'game.eventLog.coin.plural')
}

export default class EventLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            events: [],
            reactionCounts: {},
            ownReactions: {},
            matchId: null,
            expanded: !isMobileViewport(),
            menuEventId: null,
            status: '',
            loaded: false
        }
        this.scrollRef = createRef()
        this.panelRef = createRef()
        this.requestSerial = 0
        this.hasExpandedOnce = !isMobileViewport()
        this.followLatestOnReopen = true
        this.pendingFollowBottom = false
        this.savedScrollTop = 0
    }

    componentDidMount() {
        const socket = this.props.socket
        if (!socket) return
        socket.on('g-addLog', this.handleAddLog)
        socket.on('g-reactionCounts', this.handleReactionCounts)
        socket.on('g-reactionOwn', this.handleOwnReaction)
        socket.on('g-eventLogState', this.handleEventLogState)
        socket.on('g-reactionRejected', this.handleReactionRejected)
        socket.on('connect', this.handleSocketConnect)
        socket.emit('g-requestEventLogState')
    }

    componentWillUnmount() {
        const socket = this.props.socket
        if (!socket) return
        const remove = typeof socket.off === 'function' ? socket.off : socket.removeListener
        if (typeof remove !== 'function') return
        ;[
            ['g-addLog', this.handleAddLog],
            ['g-reactionCounts', this.handleReactionCounts],
            ['g-reactionOwn', this.handleOwnReaction],
            ['g-eventLogState', this.handleEventLogState],
            ['g-reactionRejected', this.handleReactionRejected],
            ['connect', this.handleSocketConnect]
        ].forEach(([event, handler]) => remove.call(socket, event, handler))
    }

    handleSocketConnect = () => {
        const socket = this.props.socket
        if (socket) socket.emit('g-requestEventLogState')
    }

    handleAddLog = event => {
        if (!event || typeof event !== 'object' || typeof event.id !== 'string' || typeof event.type !== 'string') return
        const wasExpanded = this.state.expanded
        const shouldFollow = wasExpanded ? this.isNearBottom() : this.followLatestOnReopen
        this.setState(state => {
            if (state.events.some(existing => existing.id === event.id)) return null
            return { events: state.events.concat(event) }
        }, () => {
            if (!shouldFollow) return
            if (wasExpanded && this.state.expanded) this.scrollToBottom()
            else this.pendingFollowBottom = true
        })
    }

    handleReactionCounts = update => {
        if (!update || typeof update.eventId !== 'string' || !update.counts) return
        this.setState(state => ({
            reactionCounts: { ...state.reactionCounts, [update.eventId]: update.counts }
        }))
    }

    handleOwnReaction = update => {
        if (!update || typeof update.eventId !== 'string') return
        this.setState(state => {
            const ownReactions = { ...state.ownReactions }
            if (update.reaction == null) delete ownReactions[update.eventId]
            else ownReactions[update.eventId] = update.reaction
            return { ownReactions, status: '' }
        })
    }

    handleEventLogState = snapshot => {
        if (!snapshot || !Array.isArray(snapshot.events)) return
        const reactionCounts = (snapshot.reactionCounts || []).reduce((counts, item) => {
            if (item && typeof item.eventId === 'string') counts[item.eventId] = item.counts || {}
            return counts
        }, {})
        const ownReactions = (snapshot.ownReactions || []).reduce((selected, item) => {
            if (item && typeof item.eventId === 'string' && typeof item.reaction === 'string') {
                selected[item.eventId] = item.reaction
            }
            return selected
        }, {})
        const matchChanged = this.state.matchId && snapshot.matchId !== this.state.matchId
        const snapshotEventIds = new Set(snapshot.events.map(event => event && event.id).filter(Boolean))
        const matchPrefix = snapshot.matchId ? `${snapshot.matchId}-event-` : ''
        const tailEvents = matchChanged ? [] : this.state.events.filter(event =>
            event && typeof event.id === 'string'
            && !snapshotEventIds.has(event.id)
            && (!matchPrefix || event.id.startsWith(matchPrefix))
        )
        tailEvents.forEach(event => {
            if (this.state.reactionCounts[event.id]) reactionCounts[event.id] = this.state.reactionCounts[event.id]
            if (this.state.ownReactions[event.id]) ownReactions[event.id] = this.state.ownReactions[event.id]
        })
        const wasExpanded = this.state.expanded
        const shouldFollow = !this.state.loaded || matchChanged
            || (wasExpanded ? this.isNearBottom() : this.followLatestOnReopen)
        this.setState({
            events: snapshot.events.concat(tailEvents),
            reactionCounts,
            ownReactions,
            matchId: snapshot.matchId || this.state.matchId,
            menuEventId: null,
            status: '',
            loaded: true
        }, () => {
            if (!shouldFollow) return
            if (wasExpanded || this.state.expanded) this.scrollToBottom()
            else this.pendingFollowBottom = true
        })
    }

    handleReactionRejected = () => {
        this.setState({ status: t('game.eventLog.reactionRejected') })
    }

    isNearBottom() {
        const body = this.scrollRef.current
        if (!body) return true
        return body.scrollHeight - body.scrollTop - body.clientHeight < 48
    }

    scrollToBottom() {
        const body = this.scrollRef.current
        if (body) body.scrollTop = body.scrollHeight
    }

    actionLabel(action) {
        const key = ACTION_TRANSLATION_KEYS[action]
        return key ? t(key) : t('game.actions.unknown')
    }

    roleLabel(role) {
        const key = ROLE_TRANSLATION_KEYS[String(role || '').toLowerCase()]
        return key ? t(key) : t('game.roles.unknown')
    }

    eventMessage(event) {
        const data = event.data || {}
        const markers = {}
        const params = {}
        const markPlayer = seatKey => {
            const token = PLAYER_MARKERS[seatKey]
            if (!token || !Number.isInteger(data[seatKey])) return ''
            markers[token] = data[seatKey]
            return token
        }
        const actor = markPlayer('actorSeat')
        let key = event.translation && event.translation.key

        if (event.type === 'action_declared') {
            key = data.targetSeat == null ? 'game.log.actionUsed' : 'game.log.actionUsedTarget'
            params.playerName = actor
            params.actionLabel = this.actionLabel(data.action)
            params.targetName = markPlayer('targetSeat')
        } else if (event.type === 'action_result') {
            const amount = Number.isFinite(data.amount) ? Math.max(0, data.amount) : 0
            if (data.result === 'blocked') {
                key = 'game.log.actionBlocked'
                params.playerName = actor
                params.actionLabel = this.actionLabel(data.action)
                params.blockerName = markPlayer('blockerSeat') || t('game.eventLog.unknownPlayer')
            } else if (data.action === 'exchange') {
                key = 'game.log.exchangeResolved'
                params.playerName = actor
            } else if (data.action === 'steal') {
                key = 'game.log.stealResult'
                params.playerName = actor
                params.amount = amount
                params.coinLabel = pluralCoinLabel(amount)
                params.targetName = markPlayer('targetSeat')
            } else {
                key = 'game.log.actionResult'
                params.playerName = actor
                params.amount = amount
                params.coinLabel = pluralCoinLabel(amount)
                params.actionLabel = this.actionLabel(data.action)
            }
        } else if (event.type === 'challenge_started') {
            key = 'game.log.challengeStarted'
            params.challengerName = markPlayer('actorSeat')
            params.challengeeName = markPlayer('targetSeat')
            params.actionLabel = this.actionLabel(data.action)
        } else if (event.type === 'block_declared') {
            key = 'game.log.blockDeclared'
            params.blockerName = actor
            params.roleLabel = this.roleLabel(data.claimRole)
            params.actionLabel = this.actionLabel(data.action)
            params.targetName = markPlayer('targetSeat')
        } else if (event.type === 'block_challenge_started') {
            key = 'game.log.blockChallengeStarted'
            params.challengerName = actor
            params.blockerName = markPlayer('targetSeat')
            params.actionLabel = this.actionLabel(data.action)
        } else if (event.type === 'claim_proved') {
            key = 'game.log.claimProved'
            params.playerName = actor
            params.roleLabel = this.roleLabel(data.role)
        } else if (event.type === 'claim_not_proved') {
            key = 'game.log.claimNotProved'
            params.playerName = actor
        } else if (event.type === 'influence_lost') {
            key = 'game.log.influenceLost'
            params.playerName = actor
            params.roleLabel = this.roleLabel(data.role)
        } else if (event.type === 'player_eliminated') {
            key = 'game.log.playerEliminated'
            params.playerName = actor
        }

        const message = t(key || 'game.eventLog.unknownEvent', params)
        // These sentinels are control-character-delimited to avoid collisions with player names.
        // eslint-disable-next-line no-control-regex
        const pieces = message.split(/(\u0001[a-z]+\u0001)/g)
        return pieces.map((piece, index) => {
            if (!Object.prototype.hasOwnProperty.call(markers, piece)) return piece
            const seat = markers[piece]
            const player = this.props.players && this.props.players[seat]
            return <span
                className="EventLogPlayerName"
                style={player && player.color ? { '--event-player-color': player.color } : undefined}
                key={`${event.id}-player-${seat}-${index}`}
            >{player ? player.name : t('game.eventLog.unknownPlayer')}</span>
        })
    }

    reactionLabel(reaction) {
        const option = REACTIONS[reaction]
        return option ? t(option.label) : t('game.eventLog.reaction.unknown')
    }

    react(event, reaction, restoreMenuFocus = false) {
        const socket = this.props.socket
        if (!socket || !event || !event.id) return
        const activeElement = typeof document === 'undefined' ? null : document.activeElement
        this.requestSerial += 1
        const requestId = `event-reaction-${Date.now().toString(36)}-${this.requestSerial}`
        socket.emit('g-reactToEvent', { eventId: event.id, reaction, requestId })
        this.setState({ menuEventId: null, status: '' }, () => {
            if (restoreMenuFocus || (activeElement && !activeElement.isConnected)) {
                this.focusReactionTrigger(event.id)
            }
        })
    }

    focusReactionTrigger(eventId) {
        const panel = this.panelRef.current
        if (!panel) return
        const entry = Array.from(panel.querySelectorAll('.EventLogEntry'))
            .find(element => element.dataset.eventId === eventId)
        const trigger = entry && entry.querySelector('.EventLogReactButton')
        if (trigger) trigger.focus({ preventScroll: true })
    }

    toggleReactionMenu(eventId) {
        this.setState(state => ({
            menuEventId: state.menuEventId === eventId ? null : eventId,
            status: ''
        }))
    }

    toggleExpanded = () => {
        const wasExpanded = this.state.expanded
        if (wasExpanded) {
            this.followLatestOnReopen = this.isNearBottom()
            this.savedScrollTop = this.scrollRef.current ? this.scrollRef.current.scrollTop : 0
        }
        const shouldFollowAfterOpening = !wasExpanded
            && (!this.hasExpandedOnce || this.pendingFollowBottom)
        this.setState(state => ({ expanded: !state.expanded, menuEventId: null }), () => {
            if (!this.state.expanded) return
            if (shouldFollowAfterOpening) this.scrollToBottom()
            else if (this.scrollRef.current) this.scrollRef.current.scrollTop = this.savedScrollTop
            this.pendingFollowBottom = false
            this.hasExpandedOnce = true
            this.followLatestOnReopen = this.isNearBottom()
            if (this.scrollRef.current) this.savedScrollTop = this.scrollRef.current.scrollTop
        })
    }

    renderReactionMenu(event) {
        const counts = this.state.reactionCounts[event.id] || {}
        const own = this.state.ownReactions[event.id]
        const allowed = Array.isArray(event.reactions) ? event.reactions : []
        if (this.state.menuEventId !== event.id || !allowed.length) return null
        return <div className="EventLogReactionTray" role="group" aria-label={t('game.eventLog.reactionOptions')}>
            {allowed.map(reaction => {
                const option = REACTIONS[reaction]
                if (!option) return null
                const label = this.reactionLabel(reaction)
                const count = counts[reaction] || 0
                return <button
                    className={`EventLogReactionOption${own === reaction ? ' EventLogReactionOption--selected' : ''}`}
                    type="button"
                    key={reaction}
                    aria-label={t('game.eventLog.reactWith', { reaction: label, count })}
                    aria-pressed={own === reaction}
                    onClick={() => this.react(event, reaction, true)}
                >
                    <span className="EventLogReactionEmoji" aria-hidden="true">{option.emoji}</span>
                    {count > 0 && <span className="EventLogReactionCount">{count}</span>}
                </button>
            })}
        </div>
    }

    renderEvent(event) {
        const counts = this.state.reactionCounts[event.id] || {}
        const own = this.state.ownReactions[event.id]
        const allowed = Array.isArray(event.reactions) ? event.reactions : []
        const visibleReactions = allowed.filter(reaction => (counts[reaction] || 0) > 0)
        return <article className="EventLogEntry" key={event.id} data-event-id={event.id}>
            <div className="EventLogEntryMain">
                <span className="EventLogEntryIcon" aria-hidden="true">{EVENT_ICONS[event.type] || '•'}</span>
                <p className="EventLogEntryMessage">{this.eventMessage(event)}</p>
            </div>
            <div className="EventLogEntryReactions">
                {visibleReactions.map(reaction => {
                    const option = REACTIONS[reaction]
                    if (!option) return null
                    const selected = own === reaction
                    return <button
                        className={`EventLogReactionCountButton${selected ? ' EventLogReactionCountButton--selected' : ''}`}
                        type="button"
                        key={reaction}
                        aria-label={t('game.eventLog.addReaction', {
                            reaction: this.reactionLabel(reaction),
                            count: counts[reaction]
                        })}
                        aria-pressed={selected}
                        onClick={() => this.react(event, reaction)}
                    >
                        <span aria-hidden="true">{option.emoji}</span>
                        <span>{counts[reaction]}</span>
                    </button>
                })}
                {!!allowed.length && <button
                    className={`EventLogReactButton${this.state.menuEventId === event.id ? ' EventLogReactButton--active' : ''}`}
                    type="button"
                    aria-label={t('game.eventLog.reactToEvent')}
                    aria-expanded={this.state.menuEventId === event.id}
                    onClick={() => this.toggleReactionMenu(event.id)}
                ><span className="EventLogPlusIcon" aria-hidden="true" /></button>}
            </div>
            {this.renderReactionMenu(event)}
        </article>
    }

    renderGroups() {
        const groups = []
        this.state.events.forEach(event => {
            const turn = Number.isInteger(event.turn) ? event.turn : 1
            let group = groups[groups.length - 1]
            if (!group || group.turn !== turn) {
                group = { turn, events: [] }
                groups.push(group)
            }
            group.events.push(event)
        })
        return groups.map(group => <section className="EventLogTurnGroup" key={`${group.turn}-${group.events[0].id}`}>
            <h3 className="EventLogTurnHeading">{t('game.eventLog.turn', { turn: group.turn })}</h3>
            {group.events.map(event => this.renderEvent(event))}
        </section>)
    }

    render() {
        const expanded = this.state.expanded
        return <section ref={this.panelRef} className={`EventLogPanel${expanded ? ' EventLogPanel--expanded' : ' EventLogPanel--collapsed'}`}>
            <header className="EventLogPanelHeader">
                <h2 className="EventLogPanelTitle">{t('game.eventLog.title')}</h2>
                <span className="EventLogPanelTotal" aria-label={t('game.eventLog.eventCount', { count: this.state.events.length })}>
                    {this.state.events.length}
                </span>
                <button
                    className="EventLogPanelToggle"
                    type="button"
                    aria-expanded={expanded}
                    aria-controls="event-log-content"
                    aria-label={t(expanded ? 'game.eventLog.close' : 'game.eventLog.open')}
                    onClick={this.toggleExpanded}
                >{expanded ? '−' : '+'}</button>
            </header>
            <div className="EventLogPanelBody" id="event-log-content" ref={this.scrollRef} role="log" aria-live="polite" aria-relevant="additions text">
                {this.state.events.length
                    ? this.renderGroups()
                    : <p className="EventLogEmpty">{t('game.eventLog.empty')}</p>}
            </div>
            <p className="EventLogStatus" role="status" aria-live="polite">{this.state.status}</p>
        </section>
    }
}
