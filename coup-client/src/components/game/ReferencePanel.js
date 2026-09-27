import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { t } from '../../i18n';
import cardSpanish from '../../assets/references/card-es.webp';
import tableSpanish from '../../assets/references/table-es.webp';
import './ReferencePanel.css';

const references = [
    {
        key: 'card',
        labelKey: 'referencePanel.card.label',
        contentLabelKey: 'referencePanel.card.contentLabel',
        image: cardSpanish,
        altKey: 'referencePanel.card.alt',
        width: 1024,
        height: 1536
    },
    {
        key: 'table',
        labelKey: 'referencePanel.table.label',
        contentLabelKey: 'referencePanel.table.contentLabel',
        image: tableSpanish,
        altKey: 'referencePanel.table.alt',
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
            <div className="reference-panel__triggers" role="group" aria-label={t('referencePanel.group.label')}>
                {references.map((reference) => {
                    const isOpen = openReference === reference.key;
                    const label = t(reference.labelKey);
                    const referenceName = label.toLowerCase();
                    const contentLabel = t(reference.contentLabelKey);
                    return (
                        <React.Fragment key={reference.key}>
                            <button
                                type="button"
                                className="reference-panel__trigger"
                                onClick={() => this.openReference(reference.key)}
                                aria-label={t('referencePanel.trigger.open', { referenceName })}
                                aria-haspopup="dialog"
                                aria-expanded={isOpen}
                                title={label}
                            >
                                <svg className="reference-panel__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                                    {reference.key === 'card' ? (
                                        <>
                                            <rect x="5" y="3.5" width="14" height="17" rx="2" />
                                            <path d="M8 8h8M8 11.5h8M8 15h5" />
                                        </>
                                    ) : (
                                        <>
                                            <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
                                            <path d="M3.5 9h17M9 9v11M15 9v11" />
                                        </>
                                    )}
                                </svg>
                            </button>

                            <ReactModal
                                isOpen={isOpen}
                                onRequestClose={this.closeReference}
                                contentLabel={contentLabel}
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
                                <section className="reference-panel" aria-label={contentLabel}>
                                    <button
                                        type="button"
                                        className="reference-panel__close"
                                        onClick={this.closeReference}
                                        aria-label={t('referencePanel.trigger.close', { referenceName })}
                                    >
                                        <span aria-hidden="true">×</span>
                                    </button>
                                    <img
                                        className="reference-panel__image"
                                        src={isOpen ? reference.image : undefined}
                                        alt={t(reference.altKey)}
                                        decoding="async"
                                        loading="eager"
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
