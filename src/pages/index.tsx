import Head from 'next/head'
import { ChangeEvent, FormEvent, useState } from 'react'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fullText, setFullText] = useState('');
  const [showText, setShowText] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/chat2?input=${input}`);
    const data = await response.json();
    setFullText(data.content)
    renderOneLetterAtATime(data.content);
  };

  const renderOneLetterAtATime = (text: string) => {
    const letters = text.split('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < letters.length) {
        setOutput(letters[i]);
        i++;
      } else {
        setShowText(true);
        clearInterval(interval);
      }
    }, 1500);
  };


  return (
    <>
      <Head>
        <title>Chat Ouija PT</title>
        <meta name="description" content="Your conduit to probably what the Spirit Realm would say." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='' />
        <link href="https://fonts.googleapis.com/css2?family=Averia+Serif+Libre:wght@700&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />

      </Head>
      <main className={styles.main}>
        {/* <h1>Chat Ouija</h1> */}
        <div className={styles.stylusDiv}>
          <div className={styles.letter}>{output}</div>
          <Image src='/images/stylus.png' alt="ouija stylus" width={100} height={100} className={styles.stylus} />
          <div className="fullText">{showText ? fullText : ''}</div>
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
  )
}
