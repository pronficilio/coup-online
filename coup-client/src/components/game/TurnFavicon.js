import { useEffect } from 'react'

const FRAME_NAMES = ['a', 'b', 'c', 'd', 'e', 'f']
const FRAME_INTERVAL_MS = 220

function frameUrl(frameName) {
    const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '')
    return `${publicUrl}/favicon-turn/frame-${frameName}.png`
}

export default function TurnFavicon({ isMyTurn }) {
    useEffect(() => {
        const iconLink = document.querySelector('link[rel~="icon"]')
        if (!iconLink) return undefined

        const originalHref = iconLink.getAttribute('href')
        let intervalId

        const restoreOriginalIcon = () => {
            if (originalHref === null) {
                iconLink.removeAttribute('href')
            } else {
                iconLink.setAttribute('href', originalHref)
            }
        }

        if (!isMyTurn) return undefined

        let frameIndex = 0
        const showNextFrame = () => {
            iconLink.setAttribute('href', frameUrl(FRAME_NAMES[frameIndex]))
            frameIndex = (frameIndex + 1) % FRAME_NAMES.length
        }

        showNextFrame()
        intervalId = window.setInterval(showNextFrame, FRAME_INTERVAL_MS)

        return () => {
            window.clearInterval(intervalId)
            restoreOriginalIcon()
        }
    }, [isMyTurn])

    return null
}
