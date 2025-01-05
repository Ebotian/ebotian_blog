'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      const target = e.target as HTMLElement
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer')
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <>
      {/* 主光标 - 哥特式十字架 */}
      <motion.div
        className="fixed pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          scale: isPointer ? 1.2 : 1,
          rotate: 45,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      >
        <div className="w-10 h-10 relative">
          {/* 十字架主体 */}
          <div className="absolute inset-0 border-2 border-gold bg-gradient-to-br from-gold/20 to-transparent" />
          {/* 装饰性花纹 */}
          <div className="absolute inset-0 border border-gold/50 transform rotate-45" />
          <div className="absolute inset-1 border border-gold/30 transform -rotate-45" />
          {/* 中心宝石 */}
          <div className="absolute inset-3 bg-gold/40 rounded-full" />
        </div>
      </motion.div>

      {/* 外环装饰 - 哥特式花纹 */}
      <motion.div
        className="fixed pointer-events-none z-40"
        animate={{
          x: mousePosition.x - 32,
          y: mousePosition.y - 32,
          scale: isPointer ? 1.3 : 1,
          rotate: -mousePosition.x * 0.05,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
        }}
      >
        <div className="w-16 h-16 relative">
          {/* 主环 */}
          <div className="absolute inset-0 border-2 border-gold/40 rounded-full" />
          {/* 装饰性花纹 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-6 bg-gradient-to-b from-gold/40 to-transparent"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-16px)`,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* 装饰性光晕 */}
      <motion.div
        className="fixed pointer-events-none z-30 opacity-30"
        animate={{
          x: mousePosition.x - 50,
          y: mousePosition.y - 50,
          scale: isPointer ? 1.1 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
        }}
      >
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 border border-gold rounded-full" />
          {/* 装饰性花边 */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-3 bg-gradient-to-b from-gold/20 to-transparent"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-36px)`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </>
  )
}