'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './VoiceInput.module.scss'

interface VoiceInputProps {
  isActive: boolean
  onTranscript: (text: string) => void
  onListeningChange: (listening: boolean) => void
}

export default function VoiceInput({
  isActive,
  onTranscript,
  onListeningChange,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [supported, setSupported] = useState(true)
  // eslint-disable-next-line @next/next/no-assign-module-variable
  const recognitionRef = useRef<Record<string, Function> | null>(null)

  useEffect(() => {
    const win = globalThis as Record<string, unknown>
    const SpeechRecognitionAPI =
      (win.SpeechRecognition || win.webkitSpeechRecognition) as
        | (new () => Record<string, unknown>)
        | undefined

    if (!SpeechRecognitionAPI) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognitionAPI() as Record<string, Function | boolean | string>
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = ((event: Record<string, unknown>) => {
      let interim = ''
      let finalText = ''
      const results = event.results as ArrayLike<{
        isFinal: boolean
        0: { transcript: string }
      }>
      const resultIndex = event.resultIndex as number

      for (let i = resultIndex; i < results.length; i++) {
        const transcript = results[i][0].transcript
        if (results[i].isFinal) {
          finalText += transcript
        } else {
          interim += transcript
        }
      }

      setInterimText(interim)

      if (finalText) {
        onTranscript(finalText.trim())
        setInterimText('')
      }
    }) as unknown as Function

    recognition.onstart = (() => {
      setIsListening(true)
      onListeningChange(true)
    }) as unknown as Function

    recognition.onend = (() => {
      setIsListening(false)
      onListeningChange(false)
      setInterimText('')
    }) as unknown as Function

    recognition.onerror = ((event: { error: string }) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
      }
      setIsListening(false)
      onListeningChange(false)
    }) as unknown as Function

    recognitionRef.current = recognition as unknown as Record<string, Function>

    return () => {
      (recognition as Record<string, Function>).abort()
    }
  }, [onTranscript, onListeningChange])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }, [isListening])

  // Auto-start listening when touch gate activates
  useEffect(() => {
    if (isActive && !isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch {
        // Already started
      }
    } else if (!isActive && isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [isActive, isListening])

  if (!supported) return null

  return (
    <div className={styles.voiceInput}>
      <button
        className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
        onClick={toggleListening}
        title={isListening ? 'Stop listening' : 'Speak to the spirits'}
        type="button"
      >
        <svg
          viewBox="0 0 24 24"
          className={styles.micIcon}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        {isListening && (
          <span className={styles.pulseRing} />
        )}
      </button>
      {interimText && (
        <p className={styles.interimText}>{interimText}</p>
      )}
    </div>
  )
}
