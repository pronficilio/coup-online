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
            actionError: ''
        }
    }

    chooseAction = (action, target = null) => {
        const res = {
            action: {
                action: action,
                target: target,
                source: this.props.name
            }
        }
        console.log(res)
        
        this.props.socket.emit('g-actionDecision', res)
        this.props.doneAction();
    }

    deductCoins = (action) => {
        console.log(this.props.money, action)
        if(action === 'assassinate') {
            if(this.props.money >= 3) {
                this.props.deductCoins(3);
                this.pickingTarget('assassinate');
            } else {
                this.setState({ actionError: 'Not enough coins to assassinate!'})
            }
        } else if(action === 'coup') {
            if(this.props.money >= 7) {
                this.props.deductCoins(7);
                this.pickingTarget('coup');
            } else {
                this.setState({ actionError: 'Not enough coins to coup!'})
            }
        }
    }

    pickingTarget = (action) => {
        this.setState({
            isPickingTarget: true,
            targetAction: action,
            actionError: ''
        });
        this.setState({targetAction: action});
    }

    pickTarget = (target) => {
        this.chooseAction(this.state.targetAction, target);
    }

    render() {
        let controls = null
        if(this.state.isPickingTarget) {
            controls = this.props.players.filter(x => !x.isDead).filter(x => x.name !== this.props.name).map((x, index) => {
                return <button className="TargetButton" style={{ backgroundColor: x.color}} key={index} onClick={() => this.pickTarget(x.name)}>{x.name}</button>
            })
        } else {
            const coupRequired = this.props.money >= 10
            controls = ACTIONS.map(({ action, label, description, benefit, cost, free, declaration, blockers, target }) => {
                const insufficientFunds = cost !== undefined && this.props.money < cost
                const disabled = (coupRequired && action !== 'coup') || insufficientFunds
                let onClick

                if (action === 'coup' || action === 'assassinate') {
                    onClick = () => this.deductCoins(action)
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
        return (<>
            <section className="ActionDecision">
                <p className="ActionDecisionTitle">{this.state.isPickingTarget ? 'Choose a target' : 'Choose an action'}</p>
                <div className={this.state.isPickingTarget ? 'TargetList' : 'ActionList'}>
                    {controls}
                </div>
                <p className="ActionError">{this.state.actionError}</p>
            </section>
            </>
        )
    }
}
