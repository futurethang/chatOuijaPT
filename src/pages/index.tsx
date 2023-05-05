import Head from 'next/head';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';
import LetterFade from '@/components/LetterFade';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/chat2?input=${input}`);
    const data = await response.json();
    setOutput(data.content);
  };

  return (
    <>
      <Head>
        <title>Chat Ouija PT</title>
        <meta name="description" content="Your conduit to probably what the Spirit Realm would say." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.stylusDiv}>
          {output ? <LetterFade text={output} delay={3000} /> : ''}
        </div>
        <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
          <label>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
          </label>
          <br />
          <button type="submit">Ask Sprit</button>
        </form>
      </main>
    </>
  );
}
