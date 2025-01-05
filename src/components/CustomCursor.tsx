'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const pentagramPoints = "0,-1 0.587785,0.809017 -0.951057,-0.309017 0.951057,-0.309017 -0.587785,0.809017"
const hexagramPoints = "0,-1 0.866,-0.5 0.866,0.5 0,1 -0.866,0.5 -0.866,-0.5"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null)
  const [isPointer, setIsPointer] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const rafRef = useRef<number>()

  const updatePosition = (x: number, y: number) => {
    if (cursorRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
        }
      })
    }
  }

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)

    const updateMousePosition = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY)
      const target = e.target as HTMLElement
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer')
    }

    const handleTouchStart = (e: TouchEvent) => {
      setIsTouching(true)
      updatePosition(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isTouching) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleTouchEnd = () => {
      setIsTouching(false)
    }

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isTouching])

  if (isMobile && !isTouching) return null

  return (
    <div
      className={`custom-cursor ${isTouching ? 'active' : ''}`}
      ref={cursorRef}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        top: 0,
        left: 0,
        willChange: 'transform',
        transform: 'translate3d(0px, 0px, 0)',
        zIndex: 9999
      }}
    >
      <motion.div
        className="fixed pointer-events-none z-20"
        animate={{ rotate: 360 }}
        transition={{
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          },
        }}
      >
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#88ff00,#00ff00,#00ff88,#00ffff,#0088ff,#0000ff,#8800ff,#ff00ff,#ff0088,#ff0000)] opacity-20" />
          <div className="absolute inset-[-2px] rounded-full border-2 border-white/80" />
          <div className="absolute inset-[-4px] rounded-full border-[3px] border-white/60" />
        </div>
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-40"
        animate={{ rotate: 360 }}
        transition={{
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          },
        }}
      >
        <div className="w-10 h-10 relative">
          <svg className="absolute inset-0" viewBox="-1 -1 2 2">
            <polygon points={pentagramPoints} className="fill-none stroke-[0.1] stroke-white" />
            <circle r="0.3" className="fill-none stroke-[0.05] stroke-white" />
            <line x1="0" y1="-0.3" x2="0" y2="0.3" className="stroke-[0.05] stroke-white" />
            <line x1="-0.3" y1="0" x2="0.3" y2="0" className="stroke-[0.05] stroke-white" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        className="fixed pointer-events-none z-30"
        animate={{ rotate: -360 }}
        transition={{
          rotate: {
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          },
        }}
      >
        <div className="w-[60px] h-[60px] relative">
          <div className="absolute inset-0 rounded-full border border-white" />
          <svg className="absolute inset-0" viewBox="-1 -1 2 2">
            <polygon points={hexagramPoints} className="fill-none stroke-[0.1] stroke-white" />
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180)
              const x = 0.7 * Math.cos(angle)
              const y = 0.7 * Math.sin(angle)
              return (
                <circle key={i} cx={x} cy={y} r="0.1" className="fill-white" />
              )
            })}
          </svg>
        </div>
      </motion.div>
    </div>
  )
}