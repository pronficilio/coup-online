import React, { Component } from 'react'
import { Link } from "react-router-dom";
import coin from "../assets/home-coin.gif"
import RulesModal from './RulesModal';
import { t } from '../i18n'

export default class Home extends Component {
    render() {
        return (
            <>
            <div className="homeContainer">
                <h1>{t('home.title')}</h1>
                <p>{t('home.tagline')}</p>
                <img
                    className="homeCoin"
                    src={coin}
                    alt={t('home.coin.alt')}
                    width="256"
                    height="256"
                />
                <div className="input-group-btn">
                    <Link className="home" to="/create" >{t('home.create')}</Link>
                </div>
                <div className="input-group-btn">
                    <Link className="home" to="/join" >{t('home.join')}</Link>
                </div>
                <div>
                    <div className="homeModalContainer">
                    <RulesModal home={true}/> 
                    </div>
                </div>
                

                
            </div>
            <p className="footer">
                {t('home.credit.modifiedBy')} <a className="website-link" href="https://github.com/pronficilio" target="_blank" rel="noopener noreferrer">Pronficilio</a>; {t('home.credit.originalAuthor')} <a className="website-link" href="https://github.com/cheneth" target="_blank" rel="noopener noreferrer">Ethan Chen</a>
            </p>
            <p className="version-number">{t('home.version')}</p>
            </>
        )
    }
}
