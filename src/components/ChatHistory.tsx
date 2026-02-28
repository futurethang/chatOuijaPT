'use client'

import { useEffect, useRef } from 'react'
import styles from './ChatHistory.module.scss'

interface ChatEntry {
  input: string
  response: string
}

interface ChatHistoryProps {
  chatHistory: ChatEntry[]
  onClose: () => void
}

export default function ChatHistory({ chatHistory, onClose }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Seance Record</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.messages} ref={scrollRef}>
          {chatHistory.length === 0 ? (
            <p className={styles.empty}>No messages from beyond... yet.</p>
          ) : (
            chatHistory.map((chat, i) => (
              <div key={i} className={styles.exchange}>
                <div className={styles.userMsg}>
                  <span className={styles.label}>You</span>
                  <p>{chat.input}</p>
                </div>
                <div className={styles.spiritMsg}>
                  <span className={styles.label}>Spirit</span>
                  <p>{chat.response}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
