import { useEffect } from 'react'

const FRAME_NAMES = ['a', 'b', 'c', 'd', 'e', 'f']
const FRAME_INTERVAL_MS = 100

function frameUrl(frameName) {
    const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, '')
    return `${publicUrl}/favicon-turn/frame-${frameName}.png`
}

function preloadFrame(url) {
    const image = new Image()

    if (typeof image.decode === 'function') {
        image.src = url
        return Promise.resolve().then(() => image.decode())
    }

    return new Promise((resolve, reject) => {
        const finish = () => {
            image.onload = null
            image.onerror = null
            if (image.naturalWidth > 0) resolve()
            else reject(new Error(`Could not load favicon frame: ${url}`))
        }

        image.onload = finish
        image.onerror = finish
        image.src = url
        if (image.complete) finish()
    })
}

export default function TurnFavicon({ isMyTurn }) {
    useEffect(() => {
        const iconLink = document.querySelector('link[rel~="icon"]')
        if (!iconLink) return undefined

        const originalHref = iconLink.getAttribute('href')
        let intervalId = null
        let cancelled = false

        const restoreOriginalIcon = () => {
            if (originalHref === null) {
                iconLink.removeAttribute('href')
            } else {
                iconLink.setAttribute('href', originalHref)
            }
        }

        if (!isMyTurn) return undefined

        let frameIndex = 0
        const showFrame = (index) => {
            if (!cancelled) {
                iconLink.setAttribute('href', frameUrl(FRAME_NAMES[index]))
            }
        }

        showFrame(frameIndex)
        Promise.all(FRAME_NAMES.map((frameName) => preloadFrame(frameUrl(frameName))))
            .then(() => {
                if (cancelled) return

                intervalId = window.setInterval(() => {
                    frameIndex = (frameIndex + 1) % FRAME_NAMES.length
                    showFrame(frameIndex)
                }, FRAME_INTERVAL_MS)
            })
            .catch(() => {
                if (!cancelled) restoreOriginalIcon()
            })

        return () => {
            cancelled = true
            window.clearInterval(intervalId)
            restoreOriginalIcon()
        }
    }, [isMyTurn])

    return null
}
