import React, { Component, createRef } from 'react'
import { t } from '../../i18n'
import { getEventIcon } from './EventLogAssets'
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
            animationPhase: null,
            showJumpToLive: false,
            menuEventId: null,
            status: '',
            loaded: false
        }
        this.scrollRef = createRef()
        this.panelRef = createRef()
        this.headerRef = createRef()
        this.requestSerial = 0
        this.hasExpandedOnce = !isMobileViewport()
        this.followLatestOnReopen = true
        this.pendingFollowBottom = false
        this.savedScrollTop = 0
        this.longPressTimer = null
        this.longPressOrigin = null
        this.suppressEntryClickEventId = null
        this.transitionTimer = null
    }

    componentDidMount() {
        this.setBodyInert(!this.state.expanded)
        if (typeof window !== 'undefined') window.addEventListener('resize', this.handlePanelResize)
        const socket = this.props.socket
        if (typeof this.props.onExpandedChange === 'function') {
            this.props.onExpandedChange(this.state.expanded)
        }
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
        this.cancelLongPress()
        if (typeof window !== 'undefined') window.removeEventListener('resize', this.handlePanelResize)
        if (this.transitionTimer !== null) clearTimeout(this.transitionTimer)
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

    componentDidUpdate(prevProps, prevState) {
        const contentChanged = prevState.events !== this.state.events
        const decisionLimitChanged = prevProps.decisionRailOpen !== this.props.decisionRailOpen
        if (this.state.animationPhase && (contentChanged || decisionLimitChanged)) {
            this.handlePanelResize()
        }
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
            if (!shouldFollow) {
                if (wasExpanded && this.state.expanded) this.setState({ showJumpToLive: true })
                return
            }
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
            showJumpToLive: shouldFollow ? false : this.state.showJumpToLive,
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
        if (body) {
            body.scrollTop = body.scrollHeight
            this.savedScrollTop = body.scrollTop
        }
        this.followLatestOnReopen = true
        if (this.state.showJumpToLive) this.setState({ showJumpToLive: false })
    }

    handleLogScroll = () => {
        const body = this.scrollRef.current
        if (!body) return
        const atBottom = this.isNearBottom()
        this.savedScrollTop = body.scrollTop
        this.followLatestOnReopen = atBottom
        if (this.state.showJumpToLive === atBottom) {
            this.setState({ showJumpToLive: !atBottom })
        }
    }

    setBodyInert = inert => {
        const body = this.scrollRef.current
        if (!body) return
        if (inert) body.setAttribute('inert', '')
        else body.removeAttribute('inert')
    }

    measurePanelHeight = expanded => {
        const panel = this.panelRef.current
        const header = this.headerRef.current
        const body = this.scrollRef.current
        if (!panel || !header) return 0

        const headerHeight = header.getBoundingClientRect().height
        if (!expanded || !body) return headerHeight + 2

        const styles = window.getComputedStyle(panel)
        const maxHeight = Number.parseFloat(styles.maxHeight)
        const borderHeight = Number.parseFloat(styles.borderTopWidth)
            + Number.parseFloat(styles.borderBottomWidth)
        const naturalHeight = headerHeight + body.scrollHeight + borderHeight
        return Number.isFinite(maxHeight)
            ? Math.max(headerHeight + borderHeight, Math.min(naturalHeight, maxHeight))
            : naturalHeight
    }

    handlePanelResize = () => {
        if (!this.state.animationPhase || !this.panelRef.current) return
        this.panelRef.current.style.height = `${this.measurePanelHeight(this.state.expanded)}px`
    }

    finishPanelTransition = event => {
        if (event && (event.target !== this.panelRef.current || event.propertyName !== 'height')) return
        if (this.transitionTimer !== null) clearTimeout(this.transitionTimer)
        this.transitionTimer = null
        if (!this.state.animationPhase) return
        const wasClosing = this.state.animationPhase === 'close'

        this.setState({ animationPhase: null }, () => {
            if (this.panelRef.current) this.panelRef.current.style.height = ''
            if (wasClosing && typeof this.props.onExpandedChange === 'function') {
                this.props.onExpandedChange(false)
            }
        })
    }

    jumpToLatest = () => {
        const body = this.scrollRef.current
        if (!body) return
        this.followLatestOnReopen = true
        this.pendingFollowBottom = false
        const reduceMotion = typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (typeof body.scrollTo === 'function') {
            body.scrollTo({
                top: body.scrollHeight,
                behavior: reduceMotion ? 'auto' : 'smooth'
            })
        } else {
            this.scrollToBottom()
        }
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
        const trigger = entry && (entry.querySelector('.EventLogReactButton') || entry)
        if (trigger) trigger.focus({ preventScroll: true })
    }

    reactionMenuPlacement(eventId) {
        const body = this.scrollRef.current
        const entry = body && Array.from(body.querySelectorAll('.EventLogEntry'))
            .find(element => element.dataset.eventId === eventId)
        if (!body || !entry) return 'below'
        const bodyRect = body.getBoundingClientRect()
        const entryRect = entry.getBoundingClientRect()
        const visibleTop = bodyRect.top + body.clientTop
        const visibleBottom = visibleTop + body.clientHeight
        const roomAbove = entryRect.top + 2 - visibleTop
        const roomBelow = visibleBottom - (entryRect.bottom - 2)
        const needed = (isMobileViewport() ? 60 : 52) + 8
        if (roomBelow >= needed) return 'below'
        if (roomAbove >= needed) return 'above'
        const maxScroll = Math.max(0, body.scrollHeight - body.clientHeight)
        if (roomBelow >= roomAbove) {
            body.scrollTop = Math.min(maxScroll, body.scrollTop + needed - roomBelow)
            return 'below'
        }
        body.scrollTop = Math.max(0, body.scrollTop - (needed - roomAbove))
        return 'above'
    }

    ensureReactionMenuVisible(eventId, canFlip = true, attempts = 0) {
        const body = this.scrollRef.current
        const panel = this.panelRef.current
        const entry = panel && Array.from(panel.querySelectorAll('.EventLogEntry'))
            .find(element => element.dataset.eventId === eventId)
        const tray = entry && entry.querySelector('.EventLogReactionTray')
        if (!body || !entry || !tray) return

        const bodyRect = body.getBoundingClientRect()
        const trayRect = tray.getBoundingClientRect()
        const safeTop = bodyRect.top + body.clientTop + 4
        const safeBottom = bodyRect.top + body.clientTop + body.clientHeight - 4
        const clippedAbove = trayRect.top < safeTop
        const clippedBelow = trayRect.bottom > safeBottom
        if (!clippedAbove && !clippedBelow) return

        const placement = this.state.menuPlacement || 'below'
        const otherPlacement = placement === 'below' ? 'above' : 'below'
        if (canFlip) {
            const entryRect = entry.getBoundingClientRect()
            const otherTop = otherPlacement === 'below'
                ? entryRect.bottom - 2
                : entryRect.top + 2 - trayRect.height
            const otherBottom = otherTop + trayRect.height
            if (otherTop >= safeTop && otherBottom <= safeBottom) {
                this.setState({ menuPlacement: otherPlacement }, () => {
                    this.ensureReactionMenuVisible(eventId, false, attempts + 1)
                })
                return
            }
        }

        const delta = clippedAbove ? trayRect.top - safeTop : trayRect.bottom - safeBottom
        const maxScroll = Math.max(0, body.scrollHeight - body.clientHeight)
        const nextScrollTop = Math.max(0, Math.min(maxScroll, body.scrollTop + delta))
        if (nextScrollTop !== body.scrollTop) {
            body.scrollTop = nextScrollTop
            if (attempts < 4 && typeof window !== 'undefined') {
                window.requestAnimationFrame(() => {
                    this.ensureReactionMenuVisible(eventId, canFlip, attempts + 1)
                })
            }
            return
        }

        if (canFlip && attempts < 4) {
            this.setState({ menuPlacement: otherPlacement }, () => {
                this.ensureReactionMenuVisible(eventId, false, attempts + 1)
            })
        }
    }

    openReactionMenu(eventId, focusFirstOption = false) {
        this.setState({
            menuEventId: eventId,
            menuPlacement: this.reactionMenuPlacement(eventId),
            status: ''
        }, () => {
            this.ensureReactionMenuVisible(eventId)
            if (!focusFirstOption || !this.panelRef.current) return
            const entry = Array.from(this.panelRef.current.querySelectorAll('.EventLogEntry'))
                .find(element => element.dataset.eventId === eventId)
            const firstOption = entry && entry.querySelector('.EventLogReactionOption')
            if (firstOption) firstOption.focus({ preventScroll: true })
        })
    }

    cancelLongPress = () => {
        if (this.longPressTimer) clearTimeout(this.longPressTimer)
        this.longPressTimer = null
        this.longPressOrigin = null
    }

    handleEntryPointerDown = (event, eventId) => {
        this.suppressEntryClickEventId = null
        if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
        if (event.target.closest && event.target.closest('button')) return
        this.cancelLongPress()
        const entry = event.currentTarget
        this.longPressOrigin = { x: event.clientX, y: event.clientY }
        this.longPressTimer = setTimeout(() => {
            this.longPressTimer = null
            this.longPressOrigin = null
            if (!entry.isConnected) return
            this.suppressEntryClickEventId = eventId
            entry.focus({ preventScroll: true })
            this.openReactionMenu(eventId)
        }, 500)
    }

    handleEntryClick = (event, eventId) => {
        if (event.target.closest && event.target.closest('button')) return
        if (this.suppressEntryClickEventId === eventId) {
            this.suppressEntryClickEventId = null
            return
        }
        this.toggleReactionMenu(eventId)
    }

    handleEntryPointerMove = event => {
        if (!this.longPressOrigin) return
        const distance = Math.hypot(
            event.clientX - this.longPressOrigin.x,
            event.clientY - this.longPressOrigin.y
        )
        if (distance > 10) this.cancelLongPress()
    }

    handleEntryContextMenu = (event, eventId) => {
        event.preventDefault()
        this.cancelLongPress()
        event.currentTarget.focus({ preventScroll: true })
        this.openReactionMenu(eventId)
    }

    handleEntryKeyDown = (event, eventId) => {
        if (event.key === 'Escape' && this.state.menuEventId === eventId) {
            event.preventDefault()
            this.setState({ menuEventId: null }, () => this.focusReactionTrigger(eventId))
            return
        }
        if (event.target !== event.currentTarget) return
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        if (this.state.menuEventId === eventId) this.setState({ menuEventId: null })
        else this.openReactionMenu(eventId, true)
    }

    toggleReactionMenu(eventId) {
        if (this.state.menuEventId === eventId) this.setState({ menuEventId: null })
        else this.openReactionMenu(eventId)
    }

    toggleExpanded = () => {
        const wasExpanded = this.state.expanded
        const panel = this.panelRef.current
        const transitionDuration = wasExpanded ? 180 : 220
        if (panel) {
            panel.style.height = `${panel.getBoundingClientRect().height}px`
            panel.getBoundingClientRect()
        }
        if (this.transitionTimer !== null) clearTimeout(this.transitionTimer)
        this.transitionTimer = null
        if (wasExpanded) {
            this.followLatestOnReopen = this.isNearBottom()
            this.savedScrollTop = this.scrollRef.current ? this.scrollRef.current.scrollTop : 0
        }
        const shouldFollowAfterOpening = !wasExpanded
            && (!this.hasExpandedOnce || this.pendingFollowBottom)
        this.setState(state => ({
            expanded: !state.expanded,
            animationPhase: state.expanded ? 'close' : 'open',
            menuEventId: null
        }), () => {
            this.setBodyInert(!this.state.expanded)
            if (this.state.expanded && typeof this.props.onExpandedChange === 'function') {
                this.props.onExpandedChange(this.state.expanded)
            }
            if (panel) panel.style.height = `${this.measurePanelHeight(this.state.expanded)}px`

            const reduceMotion = typeof window !== 'undefined'
                && typeof window.matchMedia === 'function'
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches
            if (reduceMotion || !panel) {
                this.finishPanelTransition()
            } else {
                this.transitionTimer = setTimeout(this.finishPanelTransition, transitionDuration + 100)
            }

            if (this.state.expanded) {
                if (shouldFollowAfterOpening) this.scrollToBottom()
                else if (this.scrollRef.current) this.scrollRef.current.scrollTop = this.savedScrollTop
                this.pendingFollowBottom = false
                this.hasExpandedOnce = true
                const atBottom = this.isNearBottom()
                this.followLatestOnReopen = atBottom
                if (this.scrollRef.current) this.savedScrollTop = this.scrollRef.current.scrollTop
                if (this.state.showJumpToLive === atBottom) {
                    this.setState({ showJumpToLive: !atBottom })
                }
            }
        })
    }

    renderReactionMenu(event) {
        const counts = this.state.reactionCounts[event.id] || {}
        const own = this.state.ownReactions[event.id]
        const allowed = Array.isArray(event.reactions) ? event.reactions : []
        if (this.state.menuEventId !== event.id || !allowed.length) return null
        return <div className={`EventLogReactionTray EventLogReactionTray--${this.state.menuPlacement || 'below'}`} role="group" aria-label={t('game.eventLog.reactionOptions')}>
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
        const menuOpen = this.state.menuEventId === event.id
        return <article
            className={`EventLogEntry${menuOpen ? ' EventLogEntry--menu-open' : ''}`}
            key={event.id}
            data-event-id={event.id}
            tabIndex={0}
            aria-keyshortcuts="Enter Space"
            onClick={e => this.handleEntryClick(e, event.id)}
            onKeyDown={e => this.handleEntryKeyDown(e, event.id)}
            onContextMenu={e => this.handleEntryContextMenu(e, event.id)}
            onPointerDown={e => this.handleEntryPointerDown(e, event.id)}
            onPointerMove={this.handleEntryPointerMove}
            onPointerUp={this.cancelLongPress}
            onPointerCancel={this.cancelLongPress}
        >
            <div className="EventLogEntryMain">
                <img className="EventLogEntryIcon" src={getEventIcon(event)} alt="" aria-hidden="true" draggable="false" />
                <div className="EventLogEntryContent">
                    <p className="EventLogEntryMessage">{this.eventMessage(event)}</p>
                    {!!visibleReactions.length && <div className="EventLogEntryReactions">
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
                                <span className="EventLogReactionEmoji" aria-hidden="true">{option.emoji}</span>
                                <span>{counts[reaction]}</span>
                            </button>
                        })}
                        {!!allowed.length && <button
                            className={`EventLogReactButton${menuOpen ? ' EventLogReactButton--active' : ''}`}
                            type="button"
                            aria-label={t('game.eventLog.reactToEvent')}
                            aria-expanded={menuOpen}
                            onClick={() => this.toggleReactionMenu(event.id)}
                        ><span className="EventLogPlusIcon" aria-hidden="true" /></button>}
                    </div>}
                </div>
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
        const decisionActive = expanded && this.props.decisionRailOpen
        const animationClass = this.state.animationPhase
            ? ` EventLogPanel--transitioning-${this.state.animationPhase}`
            : ''
        return <section
            ref={this.panelRef}
            className={`EventLogPanel${expanded ? ' EventLogPanel--expanded' : ' EventLogPanel--collapsed'}${decisionActive ? ' EventLogPanel--decision-open' : ''}${animationClass}`}
            onTransitionEnd={this.finishPanelTransition}
        >
            <header ref={this.headerRef} className="EventLogPanelHeader">
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
            <div
                className="EventLogPanelBody"
                id="event-log-content"
                ref={this.scrollRef}
                onScroll={this.handleLogScroll}
                role="log"
                aria-hidden={!expanded}
                aria-live="polite"
                aria-relevant="additions text"
            >
                {this.state.events.length
                    ? this.renderGroups()
                    : <p className="EventLogEmpty">{t('game.eventLog.empty')}</p>}
            </div>
            {expanded && this.state.showJumpToLive && <button
                className="EventLogJumpToLive"
                type="button"
                aria-label={t('game.eventLog.jumpToLatest')}
                onClick={this.jumpToLatest}
            ><span aria-hidden="true">↓</span></button>}
            <p className="EventLogStatus" role="status" aria-live="polite">{this.state.status}</p>
        </section>
    }
}
