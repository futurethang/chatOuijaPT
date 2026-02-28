'use client'

import styles from './Loading.module.scss'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.orb}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.ring} />
      </div>
      <p className={styles.text}>Reaching across the veil...</p>
    </div>
  )
}
