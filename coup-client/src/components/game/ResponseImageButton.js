import React from 'react'

export default function ResponseImageButton({
    normalImage,
    activeImage,
    accessibleLabel,
    supplementalLabel,
    disabled,
    onClick
}) {
    return (
        <button
            type="button"
            className="ResponseImageButton"
            aria-label={accessibleLabel}
            title={accessibleLabel}
            disabled={disabled}
            onClick={onClick}
        >
            <span className="ResponseImageButton__art" aria-hidden="true">
                <img className="ResponseImageButton__normal" src={normalImage} alt="" />
                <img className="ResponseImageButton__active" src={activeImage} alt="" />
            </span>
            {supplementalLabel && <span className="ResponseImageButton__supplemental">{supplementalLabel}</span>}
        </button>
    )
}
