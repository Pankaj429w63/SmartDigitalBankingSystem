/**
 * ChatbotPage — AI-powered customer support chatbot
 */
import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { chatbotService } from '../services/api';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m your AI banking assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotService.chat(input);
      const botMessage = { id: Date.now() + 1, text: response.data.data.response, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error('Chatbot is currently unavailable. Please try again later.');
      const errorMessage = { id: Date.now() + 1, text: 'Sorry, I\'m having trouble connecting. Please contact support.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <DashboardLayout title="AI Assistant">
      <div className="glass-card" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '0.75rem 1rem',
                borderRadius: '18px',
                background: msg.sender === 'user' ? 'linear-gradient(135deg,#6c63ff,#00d4aa)' : 'rgba(255,255,255,0.08)',
                color: '#f0f4ff',
                fontSize: '0.9rem'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.08)',
                color: '#f0f4ff',
                fontSize: '0.9rem'
              }}>
                <LoadingSpinner text="Thinking..." />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your banking..."
            className="form-control-custom"
            style={{ flex: 1 }}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="btn-primary-custom"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <i className="bi bi-send"></i>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotPage;