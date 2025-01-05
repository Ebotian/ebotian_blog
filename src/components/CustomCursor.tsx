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

  return (
    <>
      {/* 中心圆点 */}
      <motion.div
        className="fixed pointer-events-none z-50"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{ duration: 0, ease: "linear" }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
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

      {/* 外层魔法阵 - 八角星 */}
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
          <div className="absolute inset-0 rounded-full
            bg-[conic-gradient(from_0deg,#ff0000,#ff8800,#ffff00,#88ff00,#00ff00,#00ff88,#00ffff,#0088ff,#0000ff,#8800ff,#ff00ff,#ff0088,#ff0000)]
            opacity-20"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-[2px] bg-white origin-bottom"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )
}