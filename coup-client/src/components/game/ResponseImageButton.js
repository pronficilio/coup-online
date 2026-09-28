import React from 'react'

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
    return (
        <button
            type="button"
            className="ResponseImageButton"
            aria-label={accessibleLabel}
            title={accessibleLabel}
            disabled={disabled}
            onClick={onClick}
        >
            <span className={`ResponseImageButton__art${imageLabelStyle ? ` ResponseImageButton__art--${imageLabelStyle}` : ''}`} aria-hidden="true">
                <img className="ResponseImageButton__normal" src={normalImage} alt="" />
                <img className="ResponseImageButton__active" src={activeImage} alt="" />
                {imageLabel && <span className="ResponseImageButton__artLabel">{imageLabel}</span>}
            </span>
            {supplementalLabel && <span className="ResponseImageButton__supplemental">{supplementalLabel}</span>}
        </button>
    )
}
