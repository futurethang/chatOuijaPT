import Head from 'next/head';
import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from '@/styles/Home.module.css';
import LetterFade from '@/components/LetterFade';
import ChatHistory from '@/components/ChatHistory';

interface ChatLog {
  input: string;
  response: string;
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load chat history from local storage on mount
  useEffect(() => {
    const loadedHistory = localStorage.getItem('chatHistory');
    if (loadedHistory) {
      setChatHistory(JSON.parse(loadedHistory));
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

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
          <button onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          {showHistory && <ChatHistory chatHistory={chatHistory} setShowHistory={setShowHistory} />}
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
          <br />
          <button type="submit" onClick={handleSubmit}>Ask Sprit</button>
        </div>
      </main>
    </>
  );
}
