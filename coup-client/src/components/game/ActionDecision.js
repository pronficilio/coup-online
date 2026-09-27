import React, { Component } from 'react'

const ACTIONS = [
    {
        action: 'income',
        label: 'Income',
        description: 'Take 1 coin.',
        free: true,
        declaration: null,
        blockers: []
    },
    {
        action: 'foreign_aid',
        label: 'Foreign Aid',
        description: 'Take 2 coins.',
        free: true,
        declaration: null,
        blockers: ['Duke']
    },
    {
        action: 'coup',
        label: 'Coup',
        description: 'Pay 7 coins. Choose a player to lose an influence card.',
        cost: 7,
        declaration: null,
        blockers: [],
        target: true
    },
    {
        action: 'tax',
        label: 'Tax',
        description: 'Take 3 coins.',
        free: true,
        declaration: 'Duke',
        blockers: []
    },
    {
        action: 'steal',
        label: 'Steal',
        description: 'Take up to 2 coins from another player.',
        amount: 2,
        declaration: 'Captain',
        blockers: ['Captain', 'Ambassador'],
        target: true
    },
    {
        action: 'exchange',
        label: 'Exchange',
        description: 'Swap 2 cards with the deck.',
        free: true,
        declaration: 'Ambassador',
        blockers: []
    },
    {
        action: 'assassinate',
        label: 'Assassinate',
        description: 'Pay 3 coins. Choose a player to lose an influence card.',
        cost: 3,
        declaration: 'Assassin',
        blockers: ['Contessa'],
        target: true
    }
]

export default class ActionDecision extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            isDecisionMade: false,
            decision: '',
            isPickingTarget: false,
            targetAction: '',
            selectedTarget: '',
            actionError: ''
        }

        // Socket callbacks and rapid clicks can arrive before React finishes a
        // render. Keep submission idempotent for this mounted turn panel.
        this.submissionLocked = false
    }

    chooseAction = (action, target = null) => {
        if (this.submissionLocked) {
            return
        }

        const actionDetails = ACTIONS.find(item => item.action === action)
        if (actionDetails && actionDetails.cost !== undefined && this.props.money < actionDetails.cost) {
            this.setState({ actionError: `Requires ${actionDetails.cost} coins to ${action}.` })
            return
        }

        if (target && !this.props.players.some(player => !player.isDead && player.name === target)) {
            this.setState({ actionError: 'That player is no longer a valid target.' })
            return
        }

        this.submissionLocked = true
        const res = {
            action: {
                action: action,
                target: target,
                source: this.props.name
            }
        }
        if (actionDetails && actionDetails.cost !== undefined) {
            this.props.deductCoins(actionDetails.cost)
        }

        this.props.socket.emit('g-actionDecision', res)
        this.props.doneAction();
    }

    pickingTarget = (action) => {
        this.setState({
            isPickingTarget: true,
            targetAction: action,
            selectedTarget: '',
            actionError: ''
        });
    }

    pickTarget = (target) => {
        this.setState({ selectedTarget: target, isPickingTarget: false, actionError: '' })
    }

    cancelTargetSelection = () => {
        this.setState({
            isPickingTarget: false,
            targetAction: '',
            selectedTarget: '',
            actionError: ''
        })
    }

    confirmTarget = () => {
        if (!this.state.selectedTarget) {
            this.setState({ actionError: 'Choose a target before confirming.' })
            return
        }

        this.chooseAction(this.state.targetAction, this.state.selectedTarget)
    }

    render() {
        let controls = null
        if(this.state.isPickingTarget) {
            controls = <>
                {this.props.players.filter(x => !x.isDead).filter(x => x.name !== this.props.name).map((x, index) => {
                return <button className="TargetButton" style={{ backgroundColor: x.color}} key={index} onClick={() => this.pickTarget(x.name)}>{x.name}</button>
                })}
                <button className="ActionCancelButton" type="button" onClick={this.cancelTargetSelection}>Cancel</button>
            </>
        } else if (this.state.selectedTarget) {
            const action = ACTIONS.find(item => item.action === this.state.targetAction)
            const label = action ? action.label : this.state.targetAction
            controls = <div className="ActionConfirmation">
                <p>Confirm {label} against <strong>{this.state.selectedTarget}</strong>?</p>
                <button className="ActionConfirmButton" type="button" onClick={this.confirmTarget}>Confirm {label}</button>
                <button className="ActionCancelButton" type="button" onClick={this.cancelTargetSelection}>Cancel</button>
            </div>
        } else {
            const coupRequired = this.props.money >= 10
            controls = ACTIONS.map(({ action, label, description, cost, amount, free, declaration, blockers, target }) => {
                const insufficientFunds = cost !== undefined && this.props.money < cost
                const disabled = (coupRequired && action !== 'coup') || insufficientFunds
                let onClick

                if (action === 'coup' || action === 'assassinate') {
                    onClick = () => this.pickingTarget(action)
                } else if (target) {
                    onClick = () => this.pickingTarget(action)
                } else {
                    onClick = () => this.chooseAction(action)
                }

                return (
                    <article className={`ActionRow${disabled ? ' ActionRow--disabled' : ''}`} key={action}>
                        <div className="ActionRowContent">
                            <div className="ActionHeading">
                                <button
                                    className="ActionButton"
                                    type="button"
                                    onClick={onClick}
                                    disabled={disabled}
                                >
                                    {label}
                                </button>
                                {declaration && <span className={`ActionRoleChip ActionRoleChip--declared ActionRoleChip--${declaration.toLowerCase()}`}>{declaration}</span>}
                            </div>
                            <p className="ActionDescription">{description}</p>
                            {blockers.length > 0 && <div className="ActionMeta">
                                <span className="ActionMetaLabel">Can be blocked by</span>
                                {blockers.map(role => <span className={`ActionRoleChip ActionRoleChip--blocker ActionRoleChip--${role.toLowerCase()}`} key={role}>{role}</span>)}
                            </div>}
                            {declaration && blockers.length === 0 && <p className="ActionMeta ActionMeta--unblockable">Cannot be blocked.</p>}
                            {(insufficientFunds || (coupRequired && action !== 'coup')) && <p className="ActionWarning">{insufficientFunds ? `Requires ${cost} coins` : 'Coup required with 10+ coins'}</p>}
                        </div>
                        <span className={`ActionPrice${free ? ' ActionPrice--free' : ''}`} aria-label={free ? 'Free' : cost !== undefined ? `Costs ${cost} coins` : `Up to ${amount} coins`}>
                            {free ? 'Free' : <><span className="ActionPriceAmount">{cost !== undefined ? cost : amount}<span className="ActionCoin" aria-hidden="true">⚜</span></span></>}
                        </span>
                    </article>
                )
            })
        }
        return (
            <section className="ActionDecision">
                <h2 className="ActionDecisionTitle">{this.state.isPickingTarget ? 'Choose a target' : this.state.selectedTarget ? 'Confirm your action' : 'Actions on your turn'}</h2>
                <div className={this.state.isPickingTarget ? 'TargetList' : 'ActionList'}>
                    {controls}
                </div>
                <p className="ActionError">{this.state.actionError}</p>
            </section>
        )
    }
}
