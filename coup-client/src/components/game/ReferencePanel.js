import React, { Component } from 'react';
import ReactModal from 'react-modal';
import cardSpanish from '../../assets/references/card-es.webp';
import tableSpanish from '../../assets/references/table-es.webp';
import './ReferencePanel.css';

const references = [
    {
        key: 'card',
        label: 'Tarjeta',
        contentLabel: 'Tarjeta de referencia en español',
        image: cardSpanish,
        alt: 'Tarjeta de referencia de Coup en español',
        width: 1024,
        height: 1536
    },
    {
        key: 'table',
        label: 'Tabla',
        contentLabel: 'Tabla de referencia en español',
        image: tableSpanish,
        alt: 'Tabla de referencia de Coup en español',
        width: 1024,
        height: 768
    }
];

export default class ReferencePanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openReference: null
        };
    }

    componentDidMount() {
        const appElement = document.getElementById('root');
        if (appElement) {
            ReactModal.setAppElement(appElement);
        }
    }

    openReference = (key) => {
        this.setState({ openReference: key });
    }

    closeReference = () => {
        this.setState({ openReference: null });
    }

    render() {
        const { openReference } = this.state;
        const prefersReducedMotion = typeof window !== 'undefined'
            && typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return (
            <div className="reference-panel__triggers" role="group" aria-label="Referencias de juego">
                {references.map((reference) => {
                    const isOpen = openReference === reference.key;
                    return (
                        <React.Fragment key={reference.key}>
                            <button
                                type="button"
                                className="reference-panel__trigger"
                                onClick={() => this.openReference(reference.key)}
                                aria-haspopup="dialog"
                                aria-expanded={isOpen}
                            >
                                {reference.label}
                            </button>

                            <ReactModal
                                isOpen={isOpen}
                                onRequestClose={this.closeReference}
                                contentLabel={reference.contentLabel}
                                className={{
                                    base: `reference-panel__modal reference-panel__modal--${reference.key}`,
                                    afterOpen: 'reference-panel__modal--open',
                                    beforeClose: 'reference-panel__modal--closing'
                                }}
                                overlayClassName={{
                                    base: 'reference-panel__overlay',
                                    afterOpen: 'reference-panel__overlay--open',
                                    beforeClose: 'reference-panel__overlay--closing'
                                }}
                                closeTimeoutMS={prefersReducedMotion ? 0 : 320}
                                shouldCloseOnOverlayClick
                                shouldCloseOnEsc
                                shouldReturnFocusAfterClose
                            >
                                <section className="reference-panel" aria-label={reference.contentLabel}>
                                    <button
                                        type="button"
                                        className="reference-panel__close"
                                        onClick={this.closeReference}
                                        aria-label={`Cerrar ${reference.label.toLowerCase()}`}
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                    <img
                                        className="reference-panel__image"
                                        src={reference.image}
                                        alt={reference.alt}
                                        decoding="async"
                                        loading="lazy"
                                        width={reference.width}
                                        height={reference.height}
                                    />
                                </section>
                            </ReactModal>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }
}
