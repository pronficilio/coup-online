import React, { Component } from 'react'

const ACTIONS = [
    {
        action: 'income',
        label: 'Income',
        description: 'Gain 1 coin.',
        benefit: 'Benefit: +1 coin',
        free: true,
        declaration: 'Declared character: None',
        blockers: 'Blockers: None'
    },
    {
        action: 'foreign_aid',
        label: 'Foreign Aid',
        description: 'Gain 2 coins.',
        benefit: 'Benefit: +2 coins',
        free: true,
        declaration: 'Declared character: None',
        blockers: 'Blockers: Duke'
    },
    {
        action: 'coup',
        label: 'Coup',
        description: 'Pay 7 coins to eliminate a player.',
        cost: 7,
        declaration: 'Declared character: None',
        blockers: 'Blockers: None'
    },
    {
        action: 'tax',
        label: 'Tax',
        description: 'Gain 3 coins.',
        benefit: 'Benefit: +3 coins',
        free: true,
        declaration: 'Declared character: Duke',
        blockers: 'Blockers: None'
    },
    {
        action: 'steal',
        label: 'Steal',
        description: 'Take up to 2 coins from another player.',
        benefit: 'Benefit: up to 2 coins',
        declaration: 'Declared character: Captain',
        blockers: 'Blockers: Captain or Ambassador',
        target: true
    },
    {
        action: 'exchange',
        label: 'Exchange',
        description: 'Exchange influences.',
        free: true,
        declaration: 'Declared character: Ambassador',
        blockers: 'Blockers: None'
    },
    {
        action: 'assassinate',
        label: 'Assassinate',
        description: 'Pay 3 coins to assassinate a player.',
        cost: 3,
        declaration: 'Declared character: Assassin',
        blockers: 'Blockers: Contessa',
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
            controls = ACTIONS.map(({ action, label, description, benefit, cost, free, declaration, blockers, target }) => {
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
                    <article className={`ActionCard${disabled ? ' ActionCard--disabled' : ''}`} key={action}>
                        <button
                            className="ActionButton"
                            id={action === 'steal' ? 'captain' : action === 'assassinate' ? 'assassin' : action === 'tax' ? 'duke' : action === 'exchange' ? 'ambassador' : undefined}
                            type="button"
                            onClick={onClick}
                            disabled={disabled}
                        >
                            {label}
                        </button>
                        <p className="ActionDescription">{description}</p>
                        <div className="ActionMeta">
                            {benefit && <span className="ActionTag ActionTag--benefit">{benefit}</span>}
                            {cost !== undefined && <span className="ActionTag ActionTag--cost">Cost: {cost} coins</span>}
                            {free && <span className="ActionTag ActionTag--free">Free</span>}
                            <span className="ActionTag">{declaration}</span>
                            <span className="ActionTag">{blockers}</span>
                            {insufficientFunds && <span className="ActionTag ActionTag--warning">Requires {cost} coins</span>}
                            {coupRequired && action !== 'coup' && <span className="ActionTag ActionTag--warning">Coup required with 10+ coins</span>}
                        </div>
                    </article>
                )
            })
        }
        return (
            <section className="ActionDecision">
                <p className="ActionDecisionTitle">{this.state.isPickingTarget ? 'Choose a target' : this.state.selectedTarget ? 'Confirm your action' : 'Choose an action'}</p>
                <div className={this.state.isPickingTarget ? 'TargetList' : 'ActionList'}>
                    {controls}
                </div>
                <p className="ActionError">{this.state.actionError}</p>
            </section>
        )
    }
}
