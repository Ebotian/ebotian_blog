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
      {/* 主光标 - 箭头 */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{
          duration: 0,
          ease: "linear"
        }}
      >
        <div className="w-[20px] h-[20px] border-l-[2px] border-t-[2px] border-white transform -rotate-45 relative bottom-1 right-1" />
      </motion.div>

      {/* 魔法阵 - 内圈 */}
      <motion.div
        className="fixed pointer-events-none z-40"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          rotate: mousePosition.x * 0.1,
          scale: isPointer ? 1.2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <div className="w-10 h-10 rounded-full border border-white/30 relative">
          {/* 十字装饰 */}
          <div className="absolute inset-0 border-t border-l border-white/20 transform rotate-45" />
          <div className="absolute inset-0 border-b border-r border-white/20 transform rotate-45" />
        </div>
      </motion.div>

      {/* 魔法阵 - 外圈 */}
      <motion.div
        className="fixed pointer-events-none z-30"
        animate={{
          x: mousePosition.x - 30,
          y: mousePosition.y - 30,
          rotate: -mousePosition.x * 0.05,
          scale: isPointer ? 1.1 : 0.9,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        <div className="w-[60px] h-[60px] rounded-full border border-white/20 relative">
          {/* 装饰性光点 */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-30px)`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* 装饰性光晕 */}
      <motion.div
        className="fixed pointer-events-none z-20"
        animate={{
          x: mousePosition.x - 40,
          y: mousePosition.y - 40,
          scale: isPointer ? 1.2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm" />
      </motion.div>
    </>
  )
}