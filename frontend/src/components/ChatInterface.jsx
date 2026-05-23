import React, { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap, Sparkles, BookOpen, AlertCircle, Copy, Check } from 'lucide-react';
import apiService from '../services/api';

export default function ChatInterface({ currentDoc, userId }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome! I am your AI Study Assistant. Upload a textbook PDF, notes, or lab manual, and I will answer questions strictly based on your content.',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Restore persistent chat history whenever the active document or user changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!currentDoc || !userId) {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: 'Welcome! I am your AI Study Assistant. Upload a textbook PDF, notes, or lab manual, and I will answer questions strictly based on your content.',
            timestamp: new Date(),
          }
        ]);
        return;
      }

      setIsLoading(true);
      try {
        const history = await apiService.getHistory(currentDoc.doc_id, userId);
        if (history && history.length > 0) {
          const mappedMessages = history.map((msg, index) => ({
            id: msg.id || `${Date.now()}-${index}`,
            role: msg.role,
            content: msg.content,
            sources: msg.sources || [],
            timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
          }));
          setMessages(mappedMessages);
        } else {
          setMessages([
            {
              id: 'synced-welcome',
              role: 'assistant',
              content: `Successfully synced with "${currentDoc.filename}". Ask me any conceptual question regarding the text and I will fetch the most relevant textbook pages to respond!`,
              timestamp: new Date(),
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [currentDoc, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (!currentDoc) {
      alert("Please upload a PDF document before asking a question.");
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuery = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Call standard FastAPI backend /ask route with Clerk User ID
      const response = await apiService.askQuestion(userQuery, currentDoc.doc_id, userId);

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'error',
        content: 'Failed to retrieve an answer. Please check if the backend service is running.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="chat-container">
      {/* Scrollable messages container */}
      <div className="messages-area">
        {messages.map((msg) => {
          if (msg.role === 'error') {
            return (
              <div key={msg.id} className="message error-message-row animate-slideup">
                <AlertCircle size={16} />
                <span>{msg.content}</span>
              </div>
            );
          }

          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`message-row ${isUser ? 'user-row' : 'assistant-row'} animate-slideup`}>
              {!isUser && (
                <div className="avatar assistant-avatar">
                  <GraduationCap size={16} />
                </div>
              )}
              
              <div className={`message-bubble-wrapper`}>
                <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
                  <p className="message-text">{msg.content}</p>
                  
                  {!isUser && msg.id !== 'welcome' && (
                    <button 
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="copy-btn"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>

                {/* Sources grounding display */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="sources-wrapper">
                    <div className="sources-header">
                      <BookOpen size={12} />
                      <span>Retrieved Context ({msg.sources.length} matching segments)</span>
                    </div>
                    <div className="sources-list">
                      {msg.sources.map((src, index) => (
                        <div key={index} className="source-item">
                          <span className="source-index">Chunk {index + 1}</span>
                          <span className="source-text">{src}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="avatar user-avatar">
                  <span>U</span>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="message-row assistant-row">
            <div className="avatar assistant-avatar">
              <Sparkles size={16} className="sparkle-anim" />
            </div>
            <div className="message-bubble assistant-bubble typing-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input panel */}
      <form onSubmit={handleSend} className="input-panel">
        {!currentDoc && (
          <div className="input-blocker">
            <p>Upload a study PDF in the left panel to unlock chatting</p>
          </div>
        )}
        <div className="input-wrapper">
          <input
            type="text"
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentDoc ? `Ask a question about "${currentDoc.filename}"...` : "Upload a PDF textbook to ask questions..."}
            disabled={!currentDoc || isLoading}
          />
          <button
            type="submit"
            className={`send-button ${!inputValue.trim() || !currentDoc || isLoading ? 'disabled' : ''}`}
            disabled={!inputValue.trim() || !currentDoc || isLoading}
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(4, 8, 16, 0.2);
          position: relative;
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .message-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          max-width: 80%;
        }
        .user-row {
          align-self: flex-end;
          flex-direction: row;
        }
        .assistant-row {
          align-self: flex-start;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 600;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        .assistant-avatar {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }
        .user-avatar {
          background: linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary) / 0.8) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }
        .message-bubble-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .message-bubble {
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 0.92rem;
          line-height: 1.5;
          position: relative;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .user-bubble {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.9) 100%);
          color: white;
          border-bottom-right-radius: 2px;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
        .assistant-bubble {
          background: rgba(13, 20, 38, 0.6);
          border: 1px solid var(--border-glass);
          color: hsl(var(--text-primary));
          border-bottom-left-radius: 2px;
          backdrop-filter: blur(8px);
        }
        .message-text {
          white-space: pre-wrap;
        }
        .copy-btn {
          position: absolute;
          right: 8px;
          bottom: -22px;
          background: transparent;
          border: none;
          color: hsl(var(--text-muted));
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          opacity: 0;
          transition: var(--transition-smooth);
        }
        .message-row:hover .copy-btn {
          opacity: 1;
        }
        .copy-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }
        .error-message-row {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          color: hsl(var(--danger));
          padding: 12px 18px;
          align-self: center;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.88rem;
          max-width: 60%;
        }
        /* RETRIEVED SOURCES */
        .sources-wrapper {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          padding: 10px;
          max-width: 600px;
        }
        .sources-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          color: hsl(var(--secondary));
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 6px;
        }
        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .source-item {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          padding: 6px 10px;
          border-radius: 4px;
          border-left: 2px solid hsl(var(--secondary));
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .source-index {
          font-weight: 700;
          color: hsl(var(--text-muted));
          font-size: 0.65rem;
        }
        .source-text {
          color: hsl(var(--text-secondary));
          line-height: 1.4;
          white-space: pre-wrap;
        }
        /* TYPING ANIMATION */
        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }
        .dot {
          width: 6px;
          height: 6px;
          background-color: hsl(var(--text-secondary));
          border-radius: 50%;
          animation: typingWave 1.4s infinite ease-in-out;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        
        .sparkle-anim {
          animation: spin 3s linear infinite;
        }

        /* INPUT PANEL */
        .input-panel {
          padding: 20px 30px 24px 30px;
          background: linear-gradient(to top, rgba(8, 12, 24, 0.8) 0%, transparent 100%);
          border-top: 1px solid var(--border-glass);
          position: relative;
        }
        .input-blocker {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(8, 12, 24, 0.65);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }
        .input-blocker p {
          font-size: 0.82rem;
          font-weight: 500;
          color: hsl(var(--text-muted));
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-glass);
          padding: 6px 16px;
          border-radius: 20px;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(13, 20, 38, 0.8);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: var(--transition-smooth);
        }
        .input-wrapper:focus-within {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
        }
        .chat-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 16px 20px;
          color: white;
          font-size: 0.92rem;
        }
        .chat-input::placeholder {
          color: hsl(var(--text-muted));
        }
        .send-button {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
          border: none;
          outline: none;
          color: white;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-right: 10px;
          transition: var(--transition-smooth);
        }
        .send-button:hover:not(.disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
        }
        .send-button.disabled {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          color: hsl(var(--text-muted));
          cursor: not-allowed;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
