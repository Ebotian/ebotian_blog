'use client'

import { useEffect, useState } from 'react'
import { FaTwitter, FaBook } from 'react-icons/fa'
import { SiBilibili } from 'react-icons/si'

interface PostData {
  title: string
  date: string
  wordCount: number
  contentHtml: string
}

export default function ClientPost({ postData }: { postData: PostData }) {
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-[var(--card-bg)] shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{postData.title}</h1>
          <div className="text-gray-500 mb-4">
            {postData.date} • {postData.wordCount} 字
          </div>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
          />
        </div>
      </article>

      <div className="mt-8 bg-[var(--card-bg)] shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">分享这篇文章</h2>
        <div className="flex space-x-4">
          {/* Twitter分享 */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(postData.title)}&url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-600"
          >
            <FaTwitter size={24} />
          </a>

          {/* 小红书分享（使用红色书图标） */}
          <a
            href={`https://www.xiaohongshu.com/discovery/item?title=${encodeURIComponent(postData.title)}&url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-[#fc2c3b]"
          >
            <FaBook size={24} />
          </a>

          {/* Bilibili分享 */}
          <a
            href={`https://t.bilibili.com/?tab=article&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(postData.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            <SiBilibili size={24} />
          </a>
        </div>
      </div>
    </div>
  )
}