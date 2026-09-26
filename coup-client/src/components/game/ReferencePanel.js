import React, { Component } from 'react';
import ReactModal from 'react-modal';
import cardEnglish from '../../assets/references/card-en.webp';
import cardSpanish from '../../assets/references/card-es.webp';
import tableEnglish from '../../assets/references/table-en.webp';
import tableSpanish from '../../assets/references/table-es.webp';
import './ReferencePanel.css';

const assets = {
    card: { en: cardEnglish, es: cardSpanish },
    table: { en: tableEnglish, es: tableSpanish }
};

const tabs = [
    { key: 'card', label: 'Tarjeta' },
    { key: 'table', label: 'Tabla' }
];

let nextPanelId = 0;

export default class ReferencePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: 'card',
            language: 'en',
            isZoomed: false
        };
        this.idPrefix = `reference-panel-${nextPanelId++}`;
        this.tabButtons = [];
    }

    componentDidMount() {
        const appElement = document.getElementById('root');
        if (appElement) {
            ReactModal.setAppElement(appElement);
        }
    }

    openPanel = () => {
        this.setState({ isOpen: true, isZoomed: false });
    }

    closePanel = () => {
        this.setState({ isOpen: false, isZoomed: false });
    }

    selectTab = (activeTab) => {
        this.setState({ activeTab });
    }

    handleTabKeyDown = (event, currentIndex) => {
        let nextIndex = null;
        if (event.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
            nextIndex = (currentIndex + tabs.length - 1) % tabs.length;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
            event.preventDefault();
            const nextTab = tabs[nextIndex];
            this.setState({ activeTab: nextTab.key }, () => {
                if (this.tabButtons[nextIndex]) {
                    this.tabButtons[nextIndex].focus();
                }
            });
        }
    }

    render() {
        const { isOpen, activeTab, language, isZoomed } = this.state;
        const title = activeTab === 'card' ? 'Tarjeta' : 'Tabla';
        const selectedTabId = `${this.idPrefix}-${activeTab}-tab`;
        const titleId = `${this.idPrefix}-title`;
        const languageId = `${this.idPrefix}-language`;
        const image = assets[activeTab][language];
        const alt = activeTab === 'card'
            ? (language === 'en' ? 'Action reference card in English' : 'Tarjeta de acciones en español')
            : (language === 'en' ? 'Reference table in English' : 'Tabla de referencia en español');
        const zoomLabel = isZoomed ? 'Ajustar a pantalla' : 'Ver tamaño original';

        return (
            <>
                <button
                    type="button"
                    className="reference-panel__trigger"
                    onClick={this.openPanel}
                    aria-haspopup="dialog"
                    aria-expanded={isOpen}
                >
                    Referencias
                </button>

                <ReactModal
                    isOpen={isOpen}
                    onRequestClose={this.closePanel}
                    contentLabel="Referencias de juego"
                    className="reference-panel__modal"
                    overlayClassName="reference-panel__overlay"
                    shouldCloseOnOverlayClick
                    shouldCloseOnEsc
                    shouldReturnFocusAfterClose
                >
                    {isOpen && (
                        <section className="reference-panel" aria-labelledby={titleId}>
                            <header className="reference-panel__header">
                                <div>
                                    <p className="reference-panel__eyebrow">Consulta de juego</p>
                                    <h2 className="reference-panel__title" id={titleId}>{title}</h2>
                                </div>
                                <button
                                    type="button"
                                    className="reference-panel__close"
                                    onClick={this.closePanel}
                                    aria-label="Cerrar referencias"
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </header>

                            <div className="reference-panel__controls">
                                <div className="reference-panel__tabs" role="tablist" aria-label="Tipo de referencia">
                                    {tabs.map((tab, index) => {
                                        const tabId = `${this.idPrefix}-${tab.key}-tab`;
                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                id={tabId}
                                                ref={(element) => { this.tabButtons[index] = element; }}
                                                className={`reference-panel__tab${activeTab === tab.key ? ' is-active' : ''}`}
                                                role="tab"
                                                aria-selected={activeTab === tab.key}
                                                aria-controls={`${this.idPrefix}-tabpanel`}
                                                tabIndex={activeTab === tab.key ? 0 : -1}
                                                onClick={() => this.selectTab(tab.key)}
                                                onKeyDown={(event) => this.handleTabKeyDown(event, index)}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="reference-panel__options">
                                    <label className="reference-panel__language-label" htmlFor={languageId}>
                                        Idioma
                                    </label>
                                    <select
                                        id={languageId}
                                        className="reference-panel__language"
                                        value={language}
                                        onChange={(event) => this.setState({ language: event.target.value })}
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Español</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="reference-panel__zoom"
                                        onClick={() => this.setState({ isZoomed: !isZoomed })}
                                        aria-pressed={isZoomed}
                                    >
                                        {zoomLabel}
                                    </button>
                                </div>
                            </div>

                            <div
                                className="reference-panel__image-scroll"
                                id={`${this.idPrefix}-tabpanel`}
                                role="tabpanel"
                                aria-labelledby={selectedTabId}
                                tabIndex="0"
                            >
                                <img
                                    className={`reference-panel__image${isZoomed ? ' is-zoomed' : ''}`}
                                    src={image}
                                    alt={alt}
                                    decoding="async"
                                    width="1024"
                                    height={activeTab === 'card' ? '1536' : '768'}
                                />
                            </div>
                        </section>
                    )}
                </ReactModal>
            </>
        );
    }
}
