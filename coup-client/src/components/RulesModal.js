import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { t } from '../i18n'

export default class RulesModal extends Component {

    constructor(props) {
        super(props)
    
        this.state = {
            showRulesModal: false,
        }
    }

    handleOpenRulesModal = () => {
        this.setState({ showRulesModal: true });
    }

    handleCloseRulesModal = () => {
        this.setState({ showRulesModal: false });
    }
    
    render() {
        let modal = <ReactModal 
        isOpen={this.state.showRulesModal}
        contentLabel={t('rules.modal.a11yLabel')}
        onRequestClose={this.handleCloseRulesModal}
        shouldCloseOnOverlayClick={true}
    >
    <div className="CloseModalButtonContainer">
        <button className="CloseModalButton" onClick={this.handleCloseRulesModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21">
                <g id="more_info" data-name="more info" transform="translate(-39 -377)">
                    <g id="Ellipse_1" data-name="Ellipse 1" class="cls-5" transform="translate(39 377)">
                    <circle class="cls-7" cx="10.5" cy="10.5" r="10.5"/>
                    <circle class="cls-8" cx="10.5" cy="10.5" r="10"/>
                    </g>
                    <text id="x" class="cls-6" transform="translate(46 391)"><tspan x="0" y="0">x</tspan></text>
                </g>
            </svg>
        </button>
    </div>
   
    <div className="RulesContainer">
        <div className="RulesContent">
            <h2>{t('rules.modal.title')}</h2>
            <p>{t('rules.playerCount')}</p>
            <p>{t('rules.turn.intro')}</p>
            <p><b>{t('rules.challenge.heading')}</b>: {t('rules.challenge.body')}</p>
            <p><b>{t('rules.block.heading')}</b>: {t('rules.block.body')}</p>
            <p>{t('rules.elimination')}</p>
            <p>{t('rules.disconnect')}</p>
            <h2>{t('rules.influences.title')}</h2>
            <h3>{t('rules.cards.captain.title')}</h3>
            <p><b id="captain-color">{t('game.actions.steal.label').toUpperCase()}</b>: {t('rules.cards.captain.effect')}<hl id="captain-color">{t('game.roles.captain')}</hl>{t('rules.cards.captain.roleConnector')}<hl id="ambassador-color">{t('game.roles.ambassador')}</hl>{t('rules.cards.captain.canBlock')}<hl id="captain-color">{t('game.actions.steal.label').toUpperCase()}</hl></p>
            <h3>{t('rules.cards.assassin.title')}</h3>
            <p><b id="assassin-color">{t('game.actions.assassinate.label').toUpperCase()}</b>: {t('rules.cards.assassin.effect')}<hl id="contessa-color">{t('game.roles.contessa')}</hl>.</p>
            <h3>{t('rules.cards.duke.title')}</h3>
            <p><b id="duke-color">{t('game.actions.tax.label').toUpperCase()}</b>: {t('rules.cards.duke.effect')}</p>
            <h3>{t('rules.cards.ambassador.title')}</h3>
            <p><b id="ambassador-color">{t('game.actions.exchange.label').toUpperCase()}</b>: {t('rules.cards.ambassador.effect')}<hl id="captain-color">{t('game.actions.steal.label').toUpperCase()}</hl></p>
            <h3>{t('rules.cards.contessa.title')}</h3>
            <p><b id="contessa-color">{t('rules.cards.contessa.action')}</b>: {t('rules.cards.contessa.effect')}</p>
            <h3>{t('rules.otherActions.title')}</h3>
            <p><b>{t('game.actions.income.label').toUpperCase()}</b>: {t('rules.actions.income.effect')}</p>
            <p><b>{t('game.actions.foreignAid.label').toUpperCase()}</b>: {t('rules.actions.foreignAid.effect')}<hl id="duke-color">{t('game.roles.duke')}</hl>.</p>
            <p><b>{t('game.actions.coup.label').toUpperCase()}</b>: {t('rules.actions.coup.effect')}</p>
        </div>
    </div>
    </ReactModal>
        if(this.props.home) {
            return(
                <>
                    <div className="HomeRules" onClick={this.handleOpenRulesModal}>
                        <p>{t('common.rules')}</p>
                        <svg className="InfoIcon"xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 21 22">
                            <g id="more_info" data-name="more info" transform="translate(-39 -377)">
                                <g id="Ellipse_1" data-name="Ellipse 1" className="cls-1" transform="translate(39 377)">
                                <circle className="cls-3" cx="10.5" cy="10.5" r="10.5"/>
                                <circle className="cls-4" cx="10.5" cy="10.5" r="10"/>
                                </g>
                                <text id="i" className="cls-2" transform="translate(48 393)"><tspan x="0" y="0">i</tspan></text>
                            </g>
                        </svg>
                    </div>
                    {modal}
                </>
            )
        }
        return (
            <>
            <div className="Rules" onClick={this.handleOpenRulesModal}>
                <p>{t('common.rules')}</p>
                <svg className="InfoIcon"xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 21 22">
                    <g id="more_info" data-name="more info" transform="translate(-39 -377)">
                        <g id="Ellipse_1" data-name="Ellipse 1" className="cls-1" transform="translate(39 377)">
                        <circle className="cls-3" cx="10.5" cy="10.5" r="10.5"/>
                        <circle className="cls-4" cx="10.5" cy="10.5" r="10"/>
                        </g>
                        <text id="i" className="cls-2" transform="translate(48 393)"><tspan x="0" y="0">i</tspan></text>
                    </g>
                </svg>
            </div>
            {modal}
            </>
        )
    }
}
