import { FC, useEffect, useState } from 'react';
import styles from '@/styles/ChatHistory.module.scss';

interface ChatHistoryProps {
  chatHistory: { input: string; response: string; }[];
  setShowHistory: (showHistory: boolean) => void;
}

const ChatHistory: FC<ChatHistoryProps> = ({ chatHistory, setShowHistory }) => {
  const [localChatHistory, setLocalChatHistory] = useState(chatHistory);

  useEffect(() => {
    setLocalChatHistory(chatHistory);
  }, [chatHistory]);

  return (
    <div className={styles.chatHistory}>
      <button className={styles.closeButton} onClick={() => setShowHistory(false)}>
        COLLAPSE HISTORY
      </button>
      {localChatHistory.map((chat, i) => (
        <div key={i}>
          <div className={`${styles.message} ${styles.me}`}>
            <p>{chat.input}</p>
          </div>
          <div className={`${styles.message} ${styles.spirit}`}>
            <p>{chat.response}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
