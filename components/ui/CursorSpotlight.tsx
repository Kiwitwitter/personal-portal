'use client'

import { useEffect, useState } from 'react'

export function CursorSpotlight() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY })
            setOpacity(1)
        }

        const handleMouseLeave = () => {
            setOpacity(0)
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    return (
        <div
            className="fixed inset-0 z-[1] pointer-events-none transition-opacity duration-300"
            style={{
                opacity,
                background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(74, 222, 128, 0.06), transparent 40%)`,
            }}
        />
    )
}
