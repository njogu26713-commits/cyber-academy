import React, { useEffect, useRef, useState } from 'react';

export default function ChatOverlay({ open, onClose, messages = [], onSend }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      // scroll to bottom when messages change
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, open]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 120, display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <header style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>← Back</button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 800 }}>Kai • Groq</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your AI cybersecurity instructor</div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }} className="kai-main-scroll">
          {messages.map((m) => (
            <div key={m.id} style={{ display: 'flex', marginBottom: 12, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '82%', background: m.role === 'user' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--surface)', color: m.role === 'user' ? '#fff' : 'var(--text)', padding: '10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', boxShadow: m.role === 'user' ? '0 4px 18px rgba(124,58,237,0.12)' : 'none', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {m.text}
                {m.streaming && (
                  <span style={{ display: 'inline-block', marginLeft: 8 }}>
                    <span className="typing-dot" style={{ marginRight: 4 }}></span>
                    <span className="typing-dot" style={{ marginRight: 4 }}></span>
                    <span className="typing-dot"></span>
                  </span>
                )}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div style={{ padding: 12, borderTop: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(0,0,0,0.02), transparent)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask Kai something..." style={{ flex: 1, padding: '10px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (text.trim()) { onSend && onSend(text.trim()); setText(''); } } }} />
            <button onClick={() => { if (text.trim()) { onSend && onSend(text.trim()); setText(''); } }} style={{ padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#00ff88,#00c853)', border: 'none', color: '#03150a', fontWeight: 700 }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
