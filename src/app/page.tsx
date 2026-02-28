'use client'

import { useState, useEffect, useCallback, useRef, FormEvent } from 'react'
import Image from 'next/image'
import MistEffect from '@/components/MistEffect'
import LetterFade from '@/components/LetterFade'
import ChatHistory from '@/components/ChatHistory'
import Loading from '@/components/Loading'
import TouchGate from '@/components/TouchGate'
import VoiceInput from '@/components/VoiceInput'
import styles from './page.module.scss'

interface ChatLog {
  input: string
  response: string
}

type AppMode = 'idle' | 'touch' | 'asking' | 'revealing' | 'revealed' | 'error'

export default function OuijaBoard() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [mode, setMode] = useState<AppMode>('idle')
  const [chatHistory, setChatHistory] = useState<ChatLog[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [touchActive, setTouchActive] = useState(false)
  const [showTouchGate, setShowTouchGate] = useState(false)

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ouija_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setChatHistory(parsed)
        }
      }
    } catch {
      // Ignore corrupted data
    }
  }, [])

  // Save chat history
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('ouija_history', JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // Ref-based guard to prevent concurrent requests
  const askingRef = useRef(false)

  const dismissError = useCallback(() => {
    setErrorMsg('')
    setMode('idle')
  }, [])

  const askSpirit = useCallback(
    async (question: string) => {
      if (!question.trim() || askingRef.current) return

      askingRef.current = true
      setMode('asking')
      setOutput('')
      setErrorMsg('')

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: question.trim() }),
        })

        const data = await res.json()

        if (!res.ok) {
          setErrorMsg(data.error || 'The spirits are unreachable.')
          setMode('error')
          return
        }

        const reply = data.content || 'GOOD BYE'

        setOutput(reply)
        setChatHistory((prev) => [...prev, { input: question.trim(), response: reply }])
        setMode('revealing')
        setInput('')
      } catch {
        setErrorMsg('Could not reach the spirit realm. Check your connection.')
        setMode('error')
      } finally {
        askingRef.current = false
      }
    },
    [] // stable — no deps, uses ref for guard
  )

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      askSpirit(input)
    },
    [input, askSpirit]
  )

  const handleVoiceTranscript = useCallback(
    (text: string) => {
      setInput(text)
      askSpirit(text)
    },
    [askSpirit]
  )

  const handleAnimationEnd = useCallback(() => {
    setMode('revealed')
  }, [])

  const handleTouchActivated = useCallback(() => {
    setTouchActive(true)
  }, [])

  const handleTouchDeactivated = useCallback(() => {
    setTouchActive(false)
  }, [])

  const handleVoiceListeningChange = useCallback((_listening: boolean) => {
    // Could add visual feedback here
  }, [])

  const clearSession = useCallback(async () => {
    setChatHistory([])
    setOutput('')
    setInput('')
    setMode('idle')
    localStorage.removeItem('ouija_history')
    try {
      await fetch('/api/chat', { method: 'DELETE' })
    } catch {
      // Silent fail on session clear
    }
  }, [])

  return (
    <main className={styles.main}>
      <MistEffect />

      {/* Stylus / Planchette area */}
      <div className={styles.planchetteArea}>
        <div className={styles.planchette}>
          <Image
            src="/images/stylus.png"
            alt="Ouija planchette"
            className={styles.planchetteImg}
            width={320}
            height={320}
            priority
            draggable={false}
          />
          <div className={styles.letterWindow}>
            {mode === 'revealing' && output && (
              <LetterFade
                text={output}
                delay={900}
                onAnimationEnd={handleAnimationEnd}
              />
            )}
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className={styles.content}>
        {mode === 'asking' && <Loading />}

        {mode === 'error' && errorMsg && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{errorMsg}</p>
            <button
              className={styles.errorDismiss}
              onClick={dismissError}
              type="button"
            >
              Try Again
            </button>
          </div>
        )}

        {mode === 'revealed' && output && (
          <div className={styles.revealedMessage}>
            <p className={styles.spiritResponse}>{output}</p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className={styles.controls}>
        {/* Touch gate toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.iconBtn} ${showTouchGate ? styles.active : ''}`}
            onClick={() => setShowTouchGate(!showTouchGate)}
            title={showTouchGate ? 'Switch to text input' : 'Switch to touch + voice mode'}
            type="button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-3.3 0-6.2-2.1-7.2-5.2L2 12" />
            </svg>
          </button>
        </div>

        {showTouchGate ? (
          <>
            <VoiceInput
              isActive={touchActive}
              onTranscript={handleVoiceTranscript}
              onListeningChange={handleVoiceListeningChange}
            />
            <TouchGate
              onActivated={handleTouchActivated}
              onDeactivated={handleTouchDeactivated}
              isListening={!showHistory && mode !== 'asking'}
            />
          </>
        ) : (
          <form className={styles.inputArea} onSubmit={handleSubmit}>
            <input
              className={styles.textInput}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the spirit..."
              disabled={mode === 'asking'}
              autoComplete="off"
            />
            <button
              className={styles.askBtn}
              type="submit"
              disabled={!input.trim() || mode === 'asking'}
              title="Ask Spirit"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        )}

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            className={styles.iconBtn}
            onClick={() => setShowHistory(true)}
            title="View Seance History"
            type="button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
          <button
            className={styles.iconBtn}
            onClick={clearSession}
            title="New Seance"
            type="button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title watermark */}
      <h1 className={styles.title}>Chat OuijaPT</h1>

      {/* Chat history modal */}
      {showHistory && (
        <ChatHistory
          chatHistory={chatHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </main>
  )
}
