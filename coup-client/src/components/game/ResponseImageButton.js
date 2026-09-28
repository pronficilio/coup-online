import React, { useLayoutEffect, useRef, useState } from 'react'

const SELECTED_NORMAL_STYLE = { opacity: 0 }
const SELECTED_ACTIVE_STYLE = { opacity: 1, transform: 'scale(1)' }
const SELECTED_LABEL_STYLE = { background: 'var(--response-label-background-active)' }

export default function ResponseImageButton({
    normalImage,
    activeImage,
    accessibleLabel,
    supplementalLabel,
    imageLabel,
    imageLabelStyle,
    disabled,
    onClick
}) {
    const [submittedLocally, setSubmittedLocally] = useState(false)
    const wasDisabled = useRef(disabled)

    useLayoutEffect(() => {
        // The parent disables these controls as soon as a response is sent and
        // re-enables them on rejection or when a new decision replaces it.
        if (wasDisabled.current && !disabled) {
            setSubmittedLocally(false)
        }
        wasDisabled.current = disabled
    }, [disabled])

    const handleClick = event => {
        if (disabled) return
        onClick(event)
        setSubmittedLocally(true)
    }

    return (
        <button
            type="button"
            className="ResponseImageButton"
            aria-label={accessibleLabel}
            title={accessibleLabel}
            disabled={disabled}
            onClick={handleClick}
        >
            <span className={`ResponseImageButton__art${imageLabelStyle ? ` ResponseImageButton__art--${imageLabelStyle}` : ''}`} aria-hidden="true">
                <img className="ResponseImageButton__normal" src={normalImage} alt="" style={submittedLocally ? SELECTED_NORMAL_STYLE : undefined} />
                <img className="ResponseImageButton__active" src={activeImage} alt="" style={submittedLocally ? SELECTED_ACTIVE_STYLE : undefined} />
                {imageLabel && <span className="ResponseImageButton__artLabel" style={submittedLocally ? SELECTED_LABEL_STYLE : undefined}>{imageLabel}</span>}
            </span>
            {supplementalLabel && <span className="ResponseImageButton__supplemental">{supplementalLabel}</span>}
        </button>
    )
}
