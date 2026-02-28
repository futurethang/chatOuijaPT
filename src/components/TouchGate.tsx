'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import styles from './TouchGate.module.scss'

interface TouchGateProps {
  onActivated: () => void
  onDeactivated: () => void
  isListening: boolean
}

export default function TouchGate({
  onActivated,
  onDeactivated,
  isListening,
}: TouchGateProps) {
  const [leftTouching, setLeftTouching] = useState(false)
  const [rightTouching, setRightTouching] = useState(false)
  const [bothActive, setBothActive] = useState(false)
  const activationTimer = useRef<NodeJS.Timeout | null>(null)

  const checkActivation = useCallback(
    (left: boolean, right: boolean) => {
      if (left && right && !bothActive) {
        // Require both hands held for 400ms to activate
        activationTimer.current = setTimeout(() => {
          setBothActive(true)
          onActivated()
          // Haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30])
          }
        }, 400)
      } else if ((!left || !right) && bothActive) {
        if (activationTimer.current) clearTimeout(activationTimer.current)
        setBothActive(false)
        onDeactivated()
        if (navigator.vibrate) {
          navigator.vibrate(20)
        }
      } else if (!left && !right) {
        if (activationTimer.current) clearTimeout(activationTimer.current)
      }
    },
    [bothActive, onActivated, onDeactivated]
  )

  useEffect(() => {
    return () => {
      if (activationTimer.current) clearTimeout(activationTimer.current)
    }
  }, [])

  const handleLeftTouch = useCallback(
    (touching: boolean) => {
      setLeftTouching(touching)
      checkActivation(touching, rightTouching)
    },
    [rightTouching, checkActivation]
  )

  const handleRightTouch = useCallback(
    (touching: boolean) => {
      setRightTouching(touching)
      checkActivation(leftTouching, touching)
    },
    [leftTouching, checkActivation]
  )

  if (!isListening) return null

  return (
    <div className={styles.touchGate}>
      <div
        className={`${styles.touchZone} ${styles.left} ${leftTouching ? styles.active : ''}`}
        onTouchStart={(e) => {
          e.preventDefault()
          handleLeftTouch(true)
        }}
        onTouchEnd={() => handleLeftTouch(false)}
        onTouchCancel={() => handleLeftTouch(false)}
        onMouseDown={() => handleLeftTouch(true)}
        onMouseUp={() => handleLeftTouch(false)}
        onMouseLeave={() => handleLeftTouch(false)}
      >
        <div className={styles.fingerprint}>
          <svg viewBox="0 0 80 80" className={styles.fingerprintIcon}>
            <circle cx="40" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <circle cx="40" cy="40" r="24" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.1" />
          </svg>
        </div>
      </div>

      <div className={styles.centerIndicator}>
        <span className={`${styles.connectionLine} ${bothActive ? styles.connected : ''}`} />
        <span className={styles.statusText}>
          {bothActive
            ? 'The spirits sense your presence...'
            : 'Place both hands to begin'}
        </span>
      </div>

      <div
        className={`${styles.touchZone} ${styles.right} ${rightTouching ? styles.active : ''}`}
        onTouchStart={(e) => {
          e.preventDefault()
          handleRightTouch(true)
        }}
        onTouchEnd={() => handleRightTouch(false)}
        onTouchCancel={() => handleRightTouch(false)}
        onMouseDown={() => handleRightTouch(true)}
        onMouseUp={() => handleRightTouch(false)}
        onMouseLeave={() => handleRightTouch(false)}
      >
        <div className={styles.fingerprint}>
          <svg viewBox="0 0 80 80" className={styles.fingerprintIcon}>
            <circle cx="40" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
            <circle cx="40" cy="40" r="24" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.1" />
          </svg>
        </div>
      </div>
    </div>
  )
}
