import React from 'react';
import styles from './ChatbotToggle.module.css';

interface ChatbotToggleProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatbotToggle: React.FC<ChatbotToggleProps> = ({ onClick, isOpen }) => {
  return (
    <button
      className={`${styles.toggleButton} ${isOpen ? styles.open : ''}`}
      onClick={onClick}
      title={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
    >
      <div className={styles.icon}>
        {isOpen ? '✕' : '🤖'}
      </div>
      <div className={styles.tooltip}>
        {isOpen ? 'Close AI Assistant' : 'Ask AI about your data'}
      </div>
    </button>
  );
};

export default ChatbotToggle;
