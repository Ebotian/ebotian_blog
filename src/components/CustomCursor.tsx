'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 检测是否为移动设备
    setIsMobile(window.innerWidth <= 768)

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      const target = e.target as HTMLElement
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer')
    }

    const handleTouchStart = (e: TouchEvent) => {
      setIsTouching(true)
      setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isTouching) {
        setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })
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
    }
  }, [isTouching])

  // 生成五角星的点
  const pentagramPoints = Array.from({ length: 5 }).map((_, i) => {
    const angle = (i * 144 - 90) * (Math.PI / 180)
    return `${Math.cos(angle)},${Math.sin(angle)}`
  }).join(' ')

  // 生成六角星的点
  const hexagramPoints = Array.from({ length: 12 }).map((_, i) => {
    const r = i % 2 === 0 ? 1 : 0.6
    const angle = (i * 30 - 90) * (Math.PI / 180)
    return `${r * Math.cos(angle)},${r * Math.sin(angle)}`
  }).join(' ')

  // 如果是移动设备且没有触摸，不渲染光标
  if (isMobile && !isTouching) return null

  return (
    <div className={`custom-cursor ${isTouching ? 'active' : ''}`}>
      {/* 彩色背景层 */}
      <motion.div
        className="fixed pointer-events-none z-20"
        animate={{
          x: mousePosition.x - 40,
          y: mousePosition.y - 40,
          rotate: 360,
        }}
        transition={{
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          },
          x: { duration: 0 },
          y: { duration: 0 }
        }}
      >
        <div className="w-20 h-20 relative">
          {/* 彩色背景 */}
          <div className="absolute inset-0 rounded-full
            bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#88ff00,#00ff00,#00ff88,#00ffff,#0088ff,#0000ff,#8800ff,#ff00ff,#ff0088,#ff0000)]
            opacity-20"
          />
          {/* 外层双圈 */}
          <div className="absolute inset-[-2px] rounded-full border-2 border-white/80" />
          <div className="absolute inset-[-4px] rounded-full border-[3px] border-white/60" />
        </div>
      </motion.div>

      {/* 内层魔法阵 - 五角星 */}
      <motion.div
        className="fixed pointer-events-none z-40"
        animate={{
          x: mousePosition.x - 20,
          y: mousePosition.y - 20,
          rotate: 360,
        }}
        transition={{
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          },
          x: { duration: 0 },
          y: { duration: 0 }
        }}
      >
        <div className="w-10 h-10 relative">
          <svg className="absolute inset-0" viewBox="-1 -1 2 2">
            <polygon
              points={pentagramPoints}
              className="fill-none stroke-[0.1] stroke-white"
            />
            {/* 内部连线 */}
            <circle r="0.3" className="fill-none stroke-[0.05] stroke-white" />
            <line x1="0" y1="-0.3" x2="0" y2="0.3" className="stroke-[0.05] stroke-white" />
            <line x1="-0.3" y1="0" x2="0.3" y2="0" className="stroke-[0.05] stroke-white" />
          </svg>
        </div>
      </motion.div>

      {/* 中层魔法阵 - 六角星 */}
      <motion.div
        className="fixed pointer-events-none z-30"
        animate={{
          x: mousePosition.x - 30,
          y: mousePosition.y - 30,
          rotate: -360,
        }}
        transition={{
          rotate: {
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          },
          x: { duration: 0 },
          y: { duration: 0 }
        }}
      >
        <div className="w-[60px] h-[60px] relative">
          <div className="absolute inset-0 rounded-full border border-white" />
          <svg className="absolute inset-0" viewBox="-1 -1 2 2">
            <polygon
              points={hexagramPoints}
              className="fill-none stroke-[0.1] stroke-white"
            />
            {/* 装饰性符文 */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180)
              const x = 0.7 * Math.cos(angle)
              const y = 0.7 * Math.sin(angle)
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="0.1"
                  className="fill-white"
                />
              )
            })}
          </svg>
        </div>
      </motion.div>
    </div>
  )
}