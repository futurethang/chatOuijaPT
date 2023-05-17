import Head from 'next/head';
import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from '@/styles/Home.module.scss';
import LetterFade from '@/components/LetterFade';
import ChatHistory from '@/components/ChatHistory';
import Loading from '@/components/Loading';

interface ChatLog {
  input: string;
  response: string;
}

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatLog[]>([]);
  const [showReply, setShowReply] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    console.log('load chat history', localStorage.getItem('chatHistory'))
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      const parsedHistory = JSON.parse(savedChatHistory);
      // Ensure parsedHistory is an array before setting state
      if (Array.isArray(parsedHistory)) {
        setChatHistory(parsedHistory);
      }
    }
  }, []); // Effect runs once on mount

  // Update localStorage whenever chatHistory state changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]); // Runs whenever chatHistory changes

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowReply(false);
    const response = await fetch(`/api/chat2?input=${input}`);
    const data = await response.json();
    setOutput(data.content);
    setChatHistory([...chatHistory, { input, response: data.content }]);
    setLoading(false);
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
          {output ? <LetterFade text={output} delay={1000} onAnimationEnd={() => setShowReply(true)} /> : ''}
        </div>
        <div className={styles.lowerContent}>
          <div className={styles.loading}>
            {loading ? <Loading /> : null}
          </div>
          <div className={styles.output}>
            {showReply ? <p>{output}</p> : null}
          </div>
          {showHistory && <ChatHistory chatHistory={chatHistory} setShowHistory={setShowHistory} />}
          <input className={styles.input} type="text" value={input} onChange={(e) => setInput(e.target.value)} />
          <div className={styles.actions}>
            <button type="submit" onClick={handleSubmit} title='Ask Spirit'>
              <img src="/images/ask.png" width="40" alt="ask the Spirit" />
            </button>
            <button onClick={() => setShowHistory(!showHistory)} title="View Seance">
              <img src="/images/history.png" width="40" alt="toggle history view"></img>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
