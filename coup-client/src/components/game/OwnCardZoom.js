import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import ReactModal from 'react-modal';
import './OwnCardZoom.css';

const OPEN_DURATION_MS = 220;
const RETURN_DURATION_MS = 170;
const INTERRUPT_DURATION_MS = 120;
const CARD_MAX_WIDTH = 390;
const CARD_ASPECT_RATIO = 840 / 1220;
const CARD_MAX_HEIGHT_RATIO = 0.8;

function getReducedMotionPreference() {
    return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getTargetSize() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportGutter = viewportWidth <= 620 ? 24 : 32;
    const maxHeight = Math.min(
        viewportHeight * CARD_MAX_HEIGHT_RATIO,
        viewportHeight - viewportGutter
    );
    const width = Math.max(0, Math.min(
        CARD_MAX_WIDTH,
        viewportWidth - viewportGutter,
        maxHeight * CARD_ASPECT_RATIO
    ));

    return { width, height: width / CARD_ASPECT_RATIO };
}

function getOriginTransform(originElement, targetSize) {
    if (!originElement || !originElement.isConnected || getReducedMotionPreference()) {
        return 'none';
    }

    const originRect = originElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const { width: targetWidth, height: targetHeight } = targetSize;

    if (targetWidth <= 0 || originRect.width <= 0 || originRect.height <= 0) {
        return 'none';
    }

    const targetCenterX = viewportWidth / 2;
    const targetCenterY = viewportHeight / 2;
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;

    return `translate3d(${originCenterX - targetCenterX}px, ${originCenterY - targetCenterY}px, 0) scale(${originRect.width / targetWidth}, ${originRect.height / targetHeight})`;
}

function focusIfAvailable(element) {
    if (!element || !element.isConnected || typeof element.focus !== 'function') {
        return false;
    }

    try {
        element.focus({ preventScroll: true });
    } catch {
        element.focus();
    }
    return true;
}

export default function OwnCardZoom({
    open,
    imageSrc,
    cardName,
    cardLabel,
    originElement,
    fallbackFocusElement,
    sessionId,
    onRequestClose,
    onCloseComplete
}) {
    const [isPresent, setIsPresent] = useState(false);
    const [phase, setPhase] = useState('closed');
    const [originTransform, setOriginTransform] = useState('none');
    const [targetSize, setTargetSize] = useState({
        width: CARD_MAX_WIDTH,
        height: CARD_MAX_WIDTH / CARD_ASPECT_RATIO
    });
    const closeTimerRef = useRef(null);
    const openingTimerRef = useRef(null);
    const openingFrameRef = useRef(null);
    const originObserverRef = useRef(null);
    const previousOpenRef = useRef(false);
    const activeSessionRef = useRef(false);
    const openingRef = useRef(false);
    const invalidatedRef = useRef(false);
    const closeReasonRef = useRef(null);
    const lifecycleRef = useRef(0);
    const pendingCloseLifecycleRef = useRef(null);
    const sessionOriginRef = useRef(null);
    const sessionFallbackRef = useRef(null);
    const targetSizeRef = useRef(targetSize);
    const activeSessionIdRef = useRef(undefined);
    const generatedSessionIdRef = useRef(0);
    const openRef = useRef(Boolean(open));
    const presentRef = useRef(isPresent);
    const onRequestCloseRef = useRef(onRequestClose);
    const onCloseCompleteRef = useRef(onCloseComplete);

    openRef.current = Boolean(open);
    presentRef.current = isPresent;
    onRequestCloseRef.current = onRequestClose;
    onCloseCompleteRef.current = onCloseComplete;

    const stopWatchingOrigin = useCallback(() => {
        if (originObserverRef.current) {
            originObserverRef.current.disconnect();
            originObserverRef.current = null;
        }
        if (openingTimerRef.current !== null) {
            window.clearTimeout(openingTimerRef.current);
            openingTimerRef.current = null;
        }
        if (openingFrameRef.current !== null) {
            if (openingFrameRef.current.isAnimationFrame && typeof window.cancelAnimationFrame === 'function') {
                window.cancelAnimationFrame(openingFrameRef.current.id);
            } else {
                window.clearTimeout(openingFrameRef.current.id);
            }
            openingFrameRef.current = null;
        }
    }, []);

    const clearCloseTimer = useCallback(() => {
        if (closeTimerRef.current !== null) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    const finishOpeningTransition = useCallback((lifecycle) => {
        if (!openingRef.current || !openRef.current || invalidatedRef.current) return;
        setPhase('open');
        if (getReducedMotionPreference()) {
            openingRef.current = false;
            stopWatchingOrigin();
            return;
        }
        openingTimerRef.current = window.setTimeout(() => {
            openingTimerRef.current = null;
            if (lifecycleRef.current === lifecycle) {
                openingRef.current = false;
                stopWatchingOrigin();
            }
        }, OPEN_DURATION_MS);
    }, [stopWatchingOrigin]);

    const beginClose = useCallback((kind, lifecycle) => {
        if (!activeSessionRef.current || closeTimerRef.current !== null) return;
        openingRef.current = false;
        stopWatchingOrigin();

        if (kind === 'return' && sessionOriginRef.current && sessionOriginRef.current.isConnected) {
            setOriginTransform(getOriginTransform(sessionOriginRef.current, targetSizeRef.current));
        }

        const closingPhase = kind === 'return' ? 'closing-return' : 'closing-fade';
        const duration = getReducedMotionPreference()
            ? 0
            : (kind === 'return' ? RETURN_DURATION_MS : INTERRUPT_DURATION_MS);

        pendingCloseLifecycleRef.current = lifecycle;
        setPhase(closingPhase);
        closeTimerRef.current = window.setTimeout(() => {
            closeTimerRef.current = null;
            if (
                lifecycleRef.current !== lifecycle
                || (openRef.current && !invalidatedRef.current)
                || !activeSessionRef.current
            ) {
                return;
            }
            setIsPresent(false);
            setPhase('closed');
        }, duration);
    }, [stopWatchingOrigin]);

    const handleRequestClose = useCallback(() => {
        if (!openRef.current || invalidatedRef.current) return;
        closeReasonRef.current = 'user';
        if (typeof onRequestCloseRef.current === 'function') {
            onRequestCloseRef.current();
        }
    }, []);

    const handleContentRef = useCallback((element) => {
        if (element && !element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '-1');
        }
    }, []);

    useLayoutEffect(() => {
        if (open && !previousOpenRef.current) {
            previousOpenRef.current = true;
            const modalAlreadyPresent = presentRef.current;
            clearCloseTimer();
            stopWatchingOrigin();
            lifecycleRef.current += 1;
            const lifecycle = lifecycleRef.current;
            activeSessionRef.current = true;
            pendingCloseLifecycleRef.current = null;
            openingRef.current = true;
            invalidatedRef.current = false;
            closeReasonRef.current = null;
            sessionOriginRef.current = originElement || null;
            sessionFallbackRef.current = fallbackFocusElement || null;
            const nextTargetSize = getTargetSize();
            targetSizeRef.current = nextTargetSize;
            setTargetSize(nextTargetSize);
            if (sessionId === undefined) {
                generatedSessionIdRef.current += 1;
                activeSessionIdRef.current = generatedSessionIdRef.current;
            } else {
                activeSessionIdRef.current = sessionId;
            }

            setOriginTransform(getOriginTransform(originElement, nextTargetSize));
            setPhase('opening');
            setIsPresent(true);

            if (originElement && typeof MutationObserver !== 'undefined' && document.documentElement) {
                originObserverRef.current = new MutationObserver(() => {
                    if (openingRef.current && !originElement.isConnected && !invalidatedRef.current) {
                        invalidatedRef.current = true;
                        closeReasonRef.current = 'invalid';
                        beginClose('fade', lifecycle);
                        if (typeof onRequestCloseRef.current === 'function') {
                            onRequestCloseRef.current();
                        }
                    }
                });
                originObserverRef.current.observe(document.documentElement, {
                    childList: true,
                    subtree: true
                });
            }

            if (modalAlreadyPresent) {
                const resumeOpening = () => {
                    openingFrameRef.current = null;
                    finishOpeningTransition(lifecycle);
                };
                if (typeof window.requestAnimationFrame === 'function') {
                    openingFrameRef.current = {
                        id: window.requestAnimationFrame(resumeOpening),
                        isAnimationFrame: true
                    };
                } else {
                    openingFrameRef.current = {
                        id: window.setTimeout(resumeOpening, 0),
                        isAnimationFrame: false
                    };
                }
            }
        } else if (!open && previousOpenRef.current) {
            previousOpenRef.current = false;
            if (closeTimerRef.current === null) {
                const canReturn = closeReasonRef.current === 'user'
                    && sessionOriginRef.current
                    && sessionOriginRef.current.isConnected;
                beginClose(canReturn ? 'return' : 'fade', lifecycleRef.current);
            }
        }
    }, [
        open,
        originElement,
        fallbackFocusElement,
        sessionId,
        beginClose,
        clearCloseTimer,
        stopWatchingOrigin,
        finishOpeningTransition
    ]);

    useLayoutEffect(() => () => {
        clearCloseTimer();
        stopWatchingOrigin();
    }, [clearCloseTimer, stopWatchingOrigin]);

    const handleAfterOpen = useCallback(() => {
        finishOpeningTransition(lifecycleRef.current);
    }, [finishOpeningTransition]);

    const handleAfterClose = useCallback(() => {
        const lifecycle = pendingCloseLifecycleRef.current;
        if (
            !activeSessionRef.current
            || (openRef.current && !invalidatedRef.current)
            || presentRef.current
            || lifecycle === null
            || lifecycle !== lifecycleRef.current
        ) {
            return;
        }

        activeSessionRef.current = false;
        openingRef.current = false;
        stopWatchingOrigin();
        clearCloseTimer();

        if (!focusIfAvailable(sessionOriginRef.current)) {
            focusIfAvailable(sessionFallbackRef.current);
        }

        const completedOrigin = sessionOriginRef.current;
        const completedSessionId = activeSessionIdRef.current;
        pendingCloseLifecycleRef.current = null;
        closeReasonRef.current = null;
        if (typeof onCloseCompleteRef.current === 'function') {
            onCloseCompleteRef.current(completedOrigin, completedSessionId);
        }
    }, [clearCloseTimer, stopWatchingOrigin]);

    const contentLabel = cardName || cardLabel || 'Card';
    const contentClassName = `own-card-zoom__content own-card-zoom__content--${phase}`;
    const overlayClassName = `own-card-zoom__overlay own-card-zoom__overlay--${phase}`;

    return (
        <ReactModal
            isOpen={isPresent}
            onRequestClose={handleRequestClose}
            onAfterOpen={handleAfterOpen}
            onAfterClose={handleAfterClose}
            contentLabel={contentLabel}
            className={contentClassName}
            overlayClassName={overlayClassName}
            contentRef={handleContentRef}
            style={{ content: {
                '--own-card-zoom-origin-transform': originTransform,
                '--own-card-zoom-width': `${targetSize.width}px`
            } }}
            aria={{ modal: true }}
            closeTimeoutMS={0}
            shouldCloseOnOverlayClick
            shouldCloseOnEsc
            shouldFocusAfterRender
            shouldReturnFocusAfterClose={false}
            ariaHideApp
        >
            <section className="own-card-zoom__dialog" aria-label={contentLabel}>
                <button
                    type="button"
                    className="own-card-zoom__close"
                    onClick={handleRequestClose}
                    aria-label={cardLabel}
                >
                    <span aria-hidden="true">×</span>
                </button>
                <img
                    className="own-card-zoom__image"
                    src={imageSrc}
                    alt={cardName || ''}
                    decoding="async"
                    loading="eager"
                />
            </section>
        </ReactModal>
    );
}
