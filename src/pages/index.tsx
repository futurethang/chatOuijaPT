import Head from 'next/head';
import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from '@/styles/Home.module.css';
import LetterFade from '@/components/LetterFade';

interface ChatHistory {
  input: string;
  response: string;
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch(`/api/chat2?input=${input}`);
    const data = await response.json();
    setOutput(data.content);
    setChatHistory([...chatHistory, { input, response: data.content }]);
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
          <img src="/images/stylus.png" alt="stylus" className={styles.stylusImg} />
          {output ? <LetterFade text={output} delay={1000} onAnimationEnd={() => setLoading(false)} /> : ''}
        </div>
        <div className="lowerContent">
          <h2>{loading ? 'loading' : ''}</h2>
          <div className="history">
            <button onClick={() => setShowHistory(!showHistory)}>Show History</button>
            {showHistory ? chatHistory.map((chat, i) => {
              return (
                <div key={i}>
                  <p>YOU: {chat.input}</p>
                  <p>SPIRIT: {chat.response}</p>
                </div>
              )
            }) : ''}
          </div>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
          <br />
          <button type="submit" onClick={handleSubmit}>Ask Sprit</button>
        </div>
      </main>
    </>
  );
}
