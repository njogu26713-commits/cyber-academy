import React, { useState, useEffect, useRef, useCallback } from 'react';
import QuizModal from './QuizModal.jsx';

// Simple markdown renderer
function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code>${code.trimEnd()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
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

function Message({ msg, isLast, onQuickReply }) {
  const isUser = msg.role === 'user';
  const { text, quiz } = isUser ? { text: msg.content, quiz: null } : parseQuiz(msg.content);
  const [showQuiz, setShowQuiz] = useState(!!quiz);

  /* ── User bubble ── */
  if (isUser) {
    return (
      <div className="msg-user" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem' }}>
        <div style={{
          maxWidth: '78%',
          background: 'var(--primary)',
          borderRadius: '16px 16px 4px 16px',
          padding: '0.75rem 1.1rem',
          color: '#000', fontSize: '0.92rem', lineHeight: 1.65,
          wordBreak: 'break-word', fontWeight: 500,
        }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
        </div>
      </div>
    );
  }

  /* ── Kai full-width card with avatar on top ── */
  return (
    <div className="msg-ai" style={{ marginBottom: '1.25rem', paddingTop: '22px', position: 'relative' }}>

      {/* Avatar — centered, sitting on top of the card border */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '44px', height: '44px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #00ff88, #00e5ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.25rem', zIndex: 2,
        boxShadow: '0 0 0 3px var(--bg), 0 0 18px rgba(0,255,136,0.35)',
      }}>🤖</div>

      {/* Card — full width, merges both sides */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '1.5rem 1.25rem 1rem',
        position: 'relative',
      }}>
        {/* KAI label inside card, just below avatar */}
        <div style={{
          textAlign: 'center', fontSize: '0.68rem', fontWeight: 700,
          color: 'var(--primary)', letterSpacing: '0.1em',
          marginBottom: '0.75rem', textTransform: 'uppercase',
        }}>
          Kai · AI Instructor
        </div>

        {/* Message content */}
        <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text)', wordBreak: 'break-word' }}>
          <div className="prose" dangerouslySetInnerHTML={{ __html: `<p>${renderMarkdown(text)}</p>` }} />
        </div>

        {/* Quiz trigger */}
        {quiz && !showQuiz && (
          <button
            onClick={() => setShowQuiz(true)}
            style={{
              marginTop: '0.85rem', padding: '0.45rem 1rem', borderRadius: '8px',
              background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
              color: 'var(--primary)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
            }}
          >🎯 Take Quiz</button>
        )}

        {/* Quick reply chips */}
        {isLast && !quiz && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
            {[
              { label: 'Tell me more 📖', text: 'Tell me more about this.' },
              { label: 'Give an example 💡', text: 'Can you give me a real-world example?' },
              { label: 'Simplify this 🔄', text: 'Can you explain that more simply?' },
              { label: "What's next? ▶️", text: "What should I learn next?" },
              { label: 'I got it ✓', text: 'Got it! Keep going.' },
            ].map((qr, i) => (
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

      {showQuiz && quiz && (
        <QuizModal quiz={quiz} lessonId={msg.lessonId} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}

// ── Action mode config ──────────────────────────────────────────────────────
const MODES = [
  {
    id: 'ask',
    icon: '🤖',
    label: 'Ask Kai',
    color: 'var(--secondary)',
    glow: 'rgba(0,229,255,0.2)',
    activeBg: 'rgba(0,229,255,0.07)',
  },
  {
    id: 'quiz',
    icon: '🎯',
    label: 'Quiz Me',
    color: 'var(--primary)',
    glow: 'rgba(0,255,136,0.25)',
    activeBg: 'rgba(0,255,136,0.07)',
  },
  {
    id: 'practical',
    icon: '🛠️',
    label: 'Practical',
    color: 'var(--warning)',
    glow: 'rgba(255,204,0,0.2)',
    activeBg: 'rgba(255,204,0,0.06)',
  },
];

export default function ChatInterface({ lesson, module: mod, onProgressUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState('ask');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!lesson) return;
    setMessages([]);
    setError('');
    setStarting(true);
    setActiveMode('ask');

    fetch(`/api/chat/history/${lesson.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.messages?.length > 0) {
          setMessages(data.messages.map(m => ({ ...m, lessonId: lesson.id })));
          setStarting(false);
        } else {
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

  const sendRaw = async (text) => {
    if (!text.trim() || loading) return;
    setError('');
    const userMsg = { role: 'user', content: text.trim(), lessonId: lesson.id };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId: lesson.id, content: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI unavailable');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, lessonId: lesson.id }]);
      onProgressUpdate?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendRaw(text);
  };

  const triggerQuiz = () => {
    sendRaw(
      "Give me a quiz question about this lesson. Use the [QUIZ] format with 4 options. Pick a concept we've covered (or a key topic if we just started). Make it challenging but fair."
    );
    setActiveMode('ask');
  };

  const triggerPractical = () => {
    sendRaw(
      "Give me a hands-on practical challenge or lab exercise for this lesson. Describe exactly what I should try, what commands to run or concepts to apply, and what a successful result looks like. Keep it realistic and achievable."
    );
    setActiveMode('ask');
  };

  const handleModeClick = (id) => {
    setActiveMode(id);
    if (id === 'ask') {
      setTimeout(() => inputRef.current?.focus(), 50);
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
          💡 <strong style={{ color: 'var(--text)' }}>Tip:</strong> Use the three buttons at the bottom — <strong style={{ color: 'var(--secondary)' }}>Ask Kai</strong> to chat, <strong style={{ color: 'var(--primary)' }}>Quiz Me</strong> to test yourself, or <strong style={{ color: 'var(--warning)' }}>Practical</strong> for a hands-on challenge.
        </p>
      </div>
      <style>{`@media (max-width: 768px) { .mobile-hint { display: block !important; } }`}</style>
    </div>
  );

  const activeModeCfg = MODES.find(m => m.id === activeMode);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Lesson header */}
      <div className="chat-header" style={{
        padding: '0.9rem 1.5rem', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.8rem',
      }}>
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
          background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
          borderRadius: '999px', padding: '0.25rem 0.7rem', fontSize: '0.72rem', color: 'var(--primary)', flexShrink: 0,
        }}>
          <div style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 2s ease infinite' }} />
          Kai Online
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }} className="chat-messages">
        {starting && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff88, #00e5ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
            }}>🤖</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message
            key={i}
            msg={msg}
            isLast={i === messages.length - 1 && !loading}
            onQuickReply={(text) => sendRaw(text)}
          />
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00ff88, #00e5ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
            }}>🤖</div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255,34,68,0.08)', border: '1px solid rgba(255,34,68,0.3)',
            borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1rem',
            fontSize: '0.88rem', color: '#ff6685',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — shown only after lesson intro */}
      {messages.length === 1 && !loading && activeMode === 'ask' && (
        <div style={{ padding: '0 1.5rem 0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            "Let's start! Teach me this topic 🚀",
            "Give me an overview first",
            "Start with the basics",
          ].map(prompt => (
            <button key={prompt}
              onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
              style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '999px', padding: '0.35rem 0.9rem',
                fontSize: '0.8rem', color: 'var(--text-dim)', cursor: 'pointer',
                transition: 'border-color 0.15s', fontFamily: 'var(--sans)',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >{prompt}</button>
          ))}
        </div>
      )}

      {/* ── Mode tabs ── */}
      <div style={{
        padding: '0 1rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', gap: '0.5rem',
        paddingTop: '0.6rem',
      }}>
        {MODES.map(btn => {
          const isActive = activeMode === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => handleModeClick(btn.id)}
              disabled={loading}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '0.18rem', padding: '0.55rem 0.25rem 0.45rem',
                background: isActive ? btn.activeBg : 'transparent',
                border: `1px solid ${isActive ? btn.color : 'transparent'}`,
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: isActive ? `0 -3px 14px ${btn.glow}` : 'none',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!isActive && !loading) { e.currentTarget.style.background = btn.activeBg; e.currentTarget.style.borderColor = btn.color; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
            >
              <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{btn.icon}</span>
              <span style={{
                fontSize: '0.7rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? btn.color : 'var(--text-muted)',
                letterSpacing: '0.03em',
              }}>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Input panel (changes per mode) ── */}
      <div style={{ padding: '0 1rem 0.75rem', background: 'var(--surface)' }}>

        {activeMode === 'ask' && (
          <>
            <div style={{
              display: 'flex', gap: '0.75rem', alignItems: 'flex-end',
              background: 'var(--card)', border: `1px solid var(--border)`,
              borderRadius: '0 8px 8px 8px', padding: '0.6rem 0.6rem 0.6rem 1rem',
              transition: 'border-color 0.15s',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Kai anything about this lesson…"
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text)', fontFamily: 'var(--sans)', fontSize: '1rem',
                  resize: 'none', lineHeight: 1.5, padding: 0, maxHeight: '120px', overflowY: 'auto',
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
                  background: input.trim() && !loading ? 'var(--secondary)' : 'var(--border)',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', transition: 'background 0.15s', color: '#000',
                }}
              >↑</button>
            </div>
            <div className="chat-input-hint" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'center' }}>
              Enter to send · Shift+Enter for new line
            </div>
          </>
        )}

        {activeMode === 'quiz' && (
          <div style={{
            background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '0 8px 8px 8px', padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                🎯 Quiz Me
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Kai will ask you a scored multiple-choice question on this lesson. Your answer is saved to your progress.
              </div>
            </div>
            <button
              onClick={triggerQuiz}
              disabled={loading}
              style={{
                padding: '0.65rem 1.5rem', borderRadius: '8px', flexShrink: 0,
                background: 'var(--primary)', border: 'none', color: '#000',
                fontWeight: 700, fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 0 16px rgba(0,255,136,0.35)',
              }}
            >{loading ? 'Loading…' : '▶ Start Quiz'}</button>
          </div>
        )}

        {activeMode === 'practical' && (
          <div style={{
            background: 'rgba(255,204,0,0.05)', border: '1px solid rgba(255,204,0,0.2)',
            borderRadius: '0 8px 8px 8px', padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '1rem', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--warning)', marginBottom: '0.25rem' }}>
                🛠️ Practical Challenge
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Kai will give you a real hands-on exercise or lab task based on this lesson topic.
              </div>
            </div>
            <button
              onClick={triggerPractical}
              disabled={loading}
              style={{
                padding: '0.65rem 1.5rem', borderRadius: '8px', flexShrink: 0,
                background: 'var(--warning)', border: 'none', color: '#000',
                fontWeight: 700, fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 0 16px rgba(255,204,0,0.3)',
              }}
            >{loading ? 'Loading…' : '▶ Get Challenge'}</button>
          </div>
        )}
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
