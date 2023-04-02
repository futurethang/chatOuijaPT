import Head from 'next/head'
import { ChangeEvent, FormEvent, useState } from 'react'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api?input=${input}`);
    const data = await response.text();
    setOutput(data);
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
        <h1>Simple App</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Input:
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
          </label>
          <button type="submit">Submit</button>
        </form>
        {output && (
          <div>
            <h2>Output:</h2>
            <p>{output}</p>
          </div>
        )}
      </main>
    </>
  )
}
