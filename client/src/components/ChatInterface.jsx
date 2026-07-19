import React, { useState, useEffect, useRef, useCallback } from 'react';
import QuizModal from './QuizModal.jsx';

// Simple markdown renderer
function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code>${code.trimEnd()}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Unordered lists
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    // Ordered lists  
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Blockquote
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');
}

function parseQuiz(content) {
  const match = content.match(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/);
  if (!match) return { text: content, quiz: null };
  try {
    const quiz = JSON.parse(match[1]);
    const text = content.replace(/\[QUIZ\][\s\S]*?\[\/QUIZ\]/, '').trim();
    return { text, quiz };
  } catch {
    return { text: content, quiz: null };
  }
}

const QUICK_REPLIES = [
  { label: 'Tell me more 📖',       text: 'Tell me more about this.' },
  { label: 'Give an example 💡',    text: 'Can you give me a real-world example?' },
  { label: 'Simplify this 🔄',      text: 'Can you explain that more simply?' },
  { label: "Quiz me 🎯",            text: "Quiz me on what I've learned so far." },
  { label: "What's next? ▶️",       text: "What should I learn next?" },
  { label: 'I got it ✓',           text: 'Got it! Keep going.' },
];

function Message({ msg, isLast, onQuickReply }) {
  const isUser = msg.role === 'user';
  const { text, quiz } = isUser ? { text: msg.content, quiz: null } : parseQuiz(msg.content);
  const [showQuiz, setShowQuiz] = useState(!!quiz);

  return (
    <div
      className={isUser ? 'msg-user' : 'msg-ai'}
      style={{
        display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', flexShrink: 0, marginTop: '2px',
        }}>
          🤖
        </div>
      )}

      <div style={{ maxWidth: '85%', minWidth: '60px' }}>
        {!isUser && (
          <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
            KAI · AI Instructor
          </div>
        )}

        <div style={{
          background: isUser ? 'var(--primary)' : 'var(--card)',
          border: isUser ? 'none' : '1px solid var(--border)',
          borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          padding: '0.75rem 1rem',
          color: isUser ? '#fff' : 'var(--text)',
          fontSize: '0.92rem', lineHeight: 1.65,
          wordBreak: 'break-word',
        }}>
          {isUser ? (
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          ) : (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(text)}</p>` }}
            />
          )}
        </div>

        {/* Quiz prompt */}
        {!isUser && quiz && !showQuiz && (
          <button
            onClick={() => setShowQuiz(true)}
            className="btn btn-ghost"
            style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            🎯 Take Quiz
          </button>
        )}

        {showQuiz && quiz && (
          <QuizModal
            quiz={quiz}
            lessonId={msg.lessonId}
            onClose={() => setShowQuiz(false)}
          />
        )}

        {/* Quick reply chips — only on last Kai message */}
        {!isUser && isLast && !quiz && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.7rem',
          }}>
            {QUICK_REPLIES.map((qr, i) => (
              <button
                key={qr.label}
                className="quick-reply-chip"
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => onQuickReply(qr.text)}
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatInterface({ lesson, module: mod }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load history when lesson changes
  useEffect(() => {
    if (!lesson) return;
    setMessages([]);
    setError('');
    setStarting(true);

    fetch(`/api/chat/history/${lesson.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.messages?.length > 0) {
          setMessages(data.messages.map(m => ({ ...m, lessonId: lesson.id })));
          setStarting(false);
        } else {
          // Start the lesson with Kai's intro
          return fetch('/api/chat/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ lessonId: lesson.id }),
          })
            .then(r => r.json())
            .then(data => {
              if (data.reply) {
                setMessages([{ role: 'assistant', content: data.reply, lessonId: lesson.id }]);
              } else if (data.error) {
                setError(data.error);
              }
              setStarting(false);
            });
        }
      })
      .catch(() => { setError('Failed to load lesson.'); setStarting(false); });
  }, [lesson?.id]);

  useEffect(() => { scrollToBottom(); }, [messages, starting]);

  const send = async (overrideText) => {
    const text = (typeof overrideText === 'string' ? overrideText : input).trim();
    if (!text || loading) return;
    setInput('');
    setError('');

    const userMsg = { role: 'user', content: text, lessonId: lesson.id };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId: lesson.id, content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI unavailable');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, lessonId: lesson.id }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!lesson) return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔥</div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
        Welcome to Firebox Academy
      </h2>
      <p style={{ maxWidth: '380px', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Select a lesson from the curriculum to start learning with Kai, your AI cybersecurity instructor.
      </p>
      <p className="mobile-hint" style={{ display: 'none', fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
        Tap <strong>☰</strong> in the top-left to browse lessons
      </p>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '1.2rem 1.5rem', maxWidth: '360px',
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          💡 <strong style={{ color: 'var(--text)' }}>Tip:</strong> Kai will introduce each topic, ask you questions to check understanding, and quiz you at the end. Just have a conversation!
        </p>
      </div>
      <style>{`@media (max-width: 768px) { .mobile-hint { display: block !important; } }`}</style>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Lesson header */}
      <div
        className="chat-header"
        style={{
          padding: '0.9rem 1.5rem', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.8rem',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
            {mod?.icon} {mod?.title}
          </div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lesson.title}
          </h2>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: '999px', padding: '0.25rem 0.7rem', fontSize: '0.72rem', color: '#22c55e', flexShrink: 0,
        }}>
          <div style={{ width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s ease infinite' }} />
          Kai Online
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} className="chat-messages">
        {starting && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
            }}>🤖</div>
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '4px 16px 16px 16px', padding: '0.75rem 1rem',
            }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message
            key={i}
            msg={msg}
            isLast={i === messages.length - 1 && !loading}
            onQuickReply={(text) => send(text)}
          />
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
            }}>🤖</div>
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '4px 16px 16px 16px', padding: '0.75rem 1rem',
            }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem',
            fontSize: '0.88rem', color: '#f87171',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && !loading && (
        <div style={{ padding: '0 1.5rem 0.8rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            "Let's start! Teach me this topic 🚀",
            "Give me an overview first",
            "Start with the basics",
          ].map(prompt => (
            <button key={prompt} onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
              style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '999px', padding: '0.35rem 0.9rem',
                fontSize: '0.8rem', color: 'var(--text-dim)', cursor: 'pointer',
                transition: 'border-color 0.15s', fontFamily: 'var(--sans)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <div style={{
          display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '0.6rem 0.6rem 0.6rem 1rem',
          transition: 'border-color 0.15s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Kai anything about this lesson..."
            rows={1}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '1rem',
              resize: 'none', lineHeight: 1.5, padding: 0, maxHeight: '120px',
              overflowY: 'auto',
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
              background: input.trim() && !loading ? 'var(--primary)' : 'var(--border)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', transition: 'background 0.15s',
            }}
          >
            ↑
          </button>
        </div>
        <div className="chat-input-hint" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
          Press Enter to send · Shift+Enter for new line · Kai remembers your conversation
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-header { padding-left: 3.5rem !important; }
          .chat-messages { padding: 1rem !important; }
          .chat-input-hint { display: none !important; }
        }
      `}</style>
    </div>
  );
}
