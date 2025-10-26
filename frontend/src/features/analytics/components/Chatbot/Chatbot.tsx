import React, { useEffect, useRef, useState } from 'react';
import styles from './Chatbot.module.css';
import { apiService } from '/src/api';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  insights?: string[];
  suggestions?: string[];
}

interface ChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only auto-scroll when shouldAutoScroll is true (after user interaction)
    if (shouldAutoScroll.current) {
      scrollToBottom();
      shouldAutoScroll.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'ai',
        content: "Hello! I'm your AI analytics assistant. I can help you understand your grant management data, provide insights, and answer questions about your analytics. What would you like to know?",
        timestamp: new Date(),
        insights: [
          "Ask me about budget utilization",
          "Get insights on compliance rates",
          "Understand spending patterns"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    // Enable auto-scroll for user messages and responses
    shouldAutoScroll.current = true;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiService.chatWithAnalytics(inputMessage, {});
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        insights: response.insights,
        suggestions: response.suggestions
      };

      // Enable auto-scroll for AI response
      shouldAutoScroll.current = true;
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        timestamp: new Date()
      };
      // Enable auto-scroll for error message
      shouldAutoScroll.current = true;
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's my budget utilization?",
    "How is my compliance rate?",
    "What are the spending trends?",
    "Any insights on my grants?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    // Auto-scroll will be enabled when the message is sent
  };

  return (
    <div className={`${styles.chatbot} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.avatar}>🤠</div>
          <div className={styles.title}>
            <h3>SpaceCowboy</h3>
            <p>Ask me anything about your data</p>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onToggle}>
          ✕
        </button>
      </div>

      <div className={styles.messages}>
        {messages.map((message) => (
          <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{message.content}</div>
              {message.insights && message.insights.length > 0 && (
                <div className={styles.insights}>
                  <h4>💡 Insights:</h4>
                  <ul>
                    {message.insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  <h4>🎯 Suggestions:</h4>
                  <ul>
                    {message.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className={styles.timestamp}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.ai}`}>
            <div className={styles.messageContent}>
              <div className={styles.typing}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className={styles.quickQuestions}>
          <h4>Quick Questions:</h4>
          <div className={styles.questionButtons}>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className={styles.questionButton}
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your analytics..."
            className={styles.textInput}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={styles.sendButton}
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
