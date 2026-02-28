'use client'

import styles from './MistEffect.module.scss'

export default function MistEffect() {
  return (
    <div className={styles.mistContainer} aria-hidden="true">
      <div className={`${styles.mistLayer} ${styles.mist1}`} />
      <div className={`${styles.mistLayer} ${styles.mist2}`} />
      <div className={`${styles.mistLayer} ${styles.mist3}`} />
      <div className={`${styles.mistLayer} ${styles.mist4}`} />
      <div className={styles.vignetteOverlay} />
    </div>
  )
}
