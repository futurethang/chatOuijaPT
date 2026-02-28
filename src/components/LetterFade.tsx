'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './LetterFade.module.scss'

interface LetterFadeProps {
  text: string
  delay?: number
  onAnimationEnd?: () => void
}

export default function LetterFade({
  text = '',
  delay = 800,
  onAnimationEnd,
}: LetterFadeProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  // Reset when text changes
  useEffect(() => {
    setCurrentIndex(0)
    setPhase('in')
  }, [text])

  const handleComplete = useCallback(() => {
    onAnimationEnd?.()
  }, [onAnimationEnd])

  useEffect(() => {
    if (!text || currentIndex < 0) return

    if (currentIndex >= text.length) {
      handleComplete()
      return
    }

    const fadeInTime = delay * 0.25
    const holdTime = delay * 0.45
    const fadeOutTime = delay * 0.3

    // Phase transitions
    if (phase === 'in') {
      const timer = setTimeout(() => setPhase('hold'), fadeInTime)
      return () => clearTimeout(timer)
    }
    if (phase === 'hold') {
      const timer = setTimeout(() => setPhase('out'), holdTime)
      return () => clearTimeout(timer)
    }
    if (phase === 'out') {
      const timer = setTimeout(() => {
        setCurrentIndex((i) => i + 1)
        setPhase('in')
      }, fadeOutTime)
      return () => clearTimeout(timer)
    }
  }, [currentIndex, phase, text, delay, handleComplete])

  if (!text || currentIndex < 0 || currentIndex >= text.length) return null

  const char = text[currentIndex]
  const isSpace = char === ' '

  return (
    <div className={styles.container}>
      <span
        className={`${styles.letter} ${styles[phase]} ${isSpace ? styles.space : ''}`}
        style={{
          transitionDuration: phase === 'in'
            ? `${delay * 0.25}ms`
            : phase === 'out'
              ? `${delay * 0.3}ms`
              : '0ms',
        }}
      >
        {char}
      </span>
      <span className={styles.ghostTrail} aria-hidden="true">
        {char}
      </span>
    </div>
  )
}
