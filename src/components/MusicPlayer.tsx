'use client'

import React, { useEffect, useRef } from 'react'

interface MusicPlayerProps {
  songId: string | number
  autoPlay?: boolean
}

export default function MusicPlayer({ songId, autoPlay = true }: MusicPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // 在客户端渲染时加载 iframe
    if (iframeRef.current) {
      iframeRef.current.src = `//music.163.com/outchain/player?type=2&id=${songId}&auto=${autoPlay ? 1 : 0}&height=32`
    }
  }, [songId, autoPlay])

  return (
    <div className="my-4">
      <iframe
        ref={iframeRef}
        frameBorder="no"
        marginWidth={0}
        marginHeight={0}
        width={298}
        height={52}
        title="网易云音乐播放器"
        className="mx-auto"
      />
    </div>
  )
}