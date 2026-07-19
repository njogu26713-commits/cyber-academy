import React, { useState, useRef, useEffect, useCallback } from 'react';
import { commands, CATEGORIES, TERMINAL_SIMULATIONS } from '../data/commands.js';

const DIFFICULTY_COLOR = {
  Beginner:     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Advanced:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

// ─── Terminal Component ───────────────────────────────────────────────────────
function Terminal({ preloadCommand }) {
  const [lines, setLines] = useState([
    { type: 'info', text: '🔥 Firebox Simulated Terminal — safe practice environment' },
    { type: 'info', text: 'Type "help" to see available commands. No real commands are executed.' },
    { type: 'spacer' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (preloadCommand) {
      setInput(preloadCommand);
      inputRef.current?.focus();
    }
  }, [preloadCommand]);

  const runCommand = useCallback((cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLines = [{ type: 'prompt', text: trimmed }];

    if (trimmed === 'clear') {
      setLines([{ type: 'info', text: '🔥 Firebox Simulated Terminal — cleared.' }]);
      setHistory(h => [trimmed, ...h]);
      setHistIdx(-1);
      setInput('');
      return;
    }

    const simOutput = TERMINAL_SIMULATIONS[trimmed];
    if (simOutput) {
      if (simOutput === '__CLEAR__') {
        setLines([{ type: 'info', text: '🔥 Firebox Simulated Terminal — cleared.' }]);
      } else {
        newLines.push({ type: 'output', text: simOutput });
        setLines(l => [...l, ...newLines, { type: 'spacer' }]);
      }
    } else {
      // Fuzzy match — check if the base command matches anything
      const baseCmd = trimmed.split(' ')[0];
      const known = Object.keys(TERMINAL_SIMULATIONS).some(k => k.startsWith(baseCmd));
      if (known) {
        newLines.push({ type: 'output', text: `(Variation not simulated — try: ${Object.keys(TERMINAL_SIMULATIONS).filter(k => k.startsWith(baseCmd)).slice(0,3).join(', ')})` });
      } else {
        newLines.push({ type: 'error', text: `bash: ${baseCmd}: command not simulated. Type "help" for available commands.` });
      }
      setLines(l => [...l, ...newLines, { type: 'spacer' }]);
    }

    setHistory(h => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');
  }, []);

  const handleKey = (e) => {
    if (e.key === 'Enter') { runCommand(input); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = histIdx + 1;
      if (idx < history.length) { setHistIdx(idx); setInput(history[idx]); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = histIdx - 1;
      if (idx < 0) { setHistIdx(-1); setInput(''); }
      else { setHistIdx(idx); setInput(history[idx]); }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        background: '#0a0e1a', border: '1px solid var(--border)', borderRadius: '10px',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '0.82rem',
        height: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        cursor: 'text',
      }}
    >
      {/* Terminal title bar */}
      <div style={{
        background: '#111827', borderBottom: '1px solid var(--border)',
        padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#ef4444','#f59e0b','#22c55e'].map(c => (
            <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
        </div>
        <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: '0.5rem' }}>kai@firebox:~$</span>
      </div>

      {/* Output area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
        {lines.map((line, i) => {
          if (line.type === 'spacer') return <div key={i} style={{ height: '4px' }} />;
          if (line.type === 'prompt') return (
            <div key={i} style={{ color: '#22c55e', whiteSpace: 'pre-wrap', marginBottom: '1px' }}>
              <span style={{ color: '#f97316' }}>kai@firebox</span>
              <span style={{ color: '#64748b' }}>:</span>
              <span style={{ color: '#3b82f6' }}>~</span>
              <span style={{ color: '#64748b' }}>$ </span>
              <span style={{ color: '#e2e8f0' }}>{line.text}</span>
            </div>
          );
          if (line.type === 'error') return (
            <div key={i} style={{ color: '#ef4444', whiteSpace: 'pre-wrap', marginBottom: '1px' }}>{line.text}</div>
          );
          if (line.type === 'info') return (
            <div key={i} style={{ color: '#64748b', whiteSpace: 'pre-wrap', fontStyle: 'italic', marginBottom: '1px' }}>{line.text}</div>
          );
          return <div key={i} style={{ color: '#94a3b8', whiteSpace: 'pre-wrap', marginBottom: '1px' }}>{line.text}</div>;
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
        background: '#0d1220',
      }}>
        <span style={{ color: '#f97316', whiteSpace: 'nowrap', userSelect: 'none' }}>kai@firebox</span>
        <span style={{ color: '#64748b', userSelect: 'none' }}>:</span>
        <span style={{ color: '#3b82f6', userSelect: 'none' }}>~</span>
        <span style={{ color: '#64748b', userSelect: 'none' }}>$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          autoComplete="off"
          spellCheck={false}
          placeholder="type a command..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#e2e8f0', fontFamily: 'inherit', fontSize: 'inherit',
            caretColor: '#f97316',
          }}
        />
      </div>
    </div>
  );
}

// ─── Command Detail Panel ────────────────────────────────────────────────────
function CommandDetail({ command, learnedSet, onToggleLearned, onAskKai }) {
  const [terminalCmd, setTerminalCmd] = useState('');
  const diff = DIFFICULTY_COLOR[command.difficulty] || DIFFICULTY_COLOR.Beginner;
  const isLearned = learnedSet.has(command.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.3rem', fontFamily: '"JetBrains Mono", monospace', fontSize: '1.4rem', color: 'var(--primary)' }}>
              {command.name}
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{command.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: diff.bg, color: diff.color, fontWeight: 700 }}>
              {command.difficulty}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱ {command.estimatedTime}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>⚡ {command.xp} XP</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onAskKai(command)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), #ef4444)',
              border: 'none', color: '#fff', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 700,
            }}
          >
            🤖 Ask Kai
          </button>
          <button
            onClick={() => onToggleLearned(command.id)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: isLearned ? 'rgba(34,197,94,0.12)' : 'var(--card)',
              border: `1px solid ${isLearned ? 'var(--success)' : 'var(--border)'}`,
              color: isLearned ? 'var(--success)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
            }}
          >
            {isLearned ? '✓ Marked Learned' : '○ Mark as Learned'}
          </button>
        </div>
      </div>

      {/* Syntax */}
      <section>
        <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Syntax</h3>
        <div style={{
          background: '#0a0e1a', borderRadius: '8px', padding: '0.75rem 1rem',
          fontFamily: '"JetBrains Mono", monospace', fontSize: '0.88rem', color: '#22c55e',
          border: '1px solid rgba(34,197,94,0.2)',
        }}>
          {command.syntax}
        </div>
      </section>

      {/* Purpose */}
      <section>
        <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Purpose</h3>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.7 }}>{command.purpose}</p>
      </section>

      {/* Flags */}
      {command.flags?.length > 0 && (
        <section>
          <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Flags & Options</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {command.flags.map(f => (
              <div key={f.flag} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                background: 'var(--card)', borderRadius: '8px', padding: '0.6rem 0.85rem',
              }}>
                <code style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem',
                  color: 'var(--primary)', whiteSpace: 'nowrap', flexShrink: 0,
                  background: 'rgba(249,115,22,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px',
                }}>
                  {f.flag}
                </code>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Examples */}
      {command.examples?.length > 0 && (
        <section>
          <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Examples</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {command.examples.map((ex, i) => (
              <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '0.6rem 0.85rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ex.description}</span>
                  <button
                    onClick={() => setTerminalCmd(ex.command)}
                    style={{
                      background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
                      borderRadius: '6px', color: 'var(--primary)', cursor: 'pointer',
                      fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.5rem', whiteSpace: 'nowrap',
                    }}
                  >
                    ▶ Try it
                  </button>
                </div>
                <div style={{ background: '#0a0e1a', padding: '0.6rem 0.85rem' }}>
                  <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', color: '#22c55e', marginBottom: '0.5rem' }}>
                    $ {ex.command}
                  </div>
                  <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {ex.output}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Common mistakes */}
      {command.commonMistakes?.length > 0 && (
        <section>
          <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚠️ Common Mistakes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {command.commonMistakes.map((m, i) => (
              <div key={i} style={{
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', padding: '0.6rem 0.85rem',
                fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.5,
              }}>
                {m}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related commands */}
      {command.relatedCommands?.length > 0 && (
        <section>
          <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Related Commands</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {command.relatedCommands.map(r => (
              <span key={r} style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem',
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '6px', padding: '0.25rem 0.6rem', color: 'var(--secondary)',
              }}>
                {r}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Practice Terminal */}
      <section>
        <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          💻 Practice Terminal
        </h3>
        <Terminal preloadCommand={terminalCmd} />
      </section>
    </div>
  );
}

// ─── Ask Kai Modal ────────────────────────────────────────────────────────────
function AskKaiModal({ command, onClose }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey! I'm Kai 🤖 — ready to help you master **${command.name}**.\n\nI can explain what each flag does, walk through examples, or answer any question you have about this command. What would you like to know?`,
    }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (overrideQ) => {
    const q = (overrideQ || question).trim();
    if (!q || loading) return;
    setQuestion('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const context = `Command reference: ${command.name}\nDescription: ${command.description}\nSyntax: ${command.syntax}\nPurpose: ${command.purpose}\nFlags: ${command.flags?.map(f => `${f.flag}: ${f.description}`).join(', ')}\nExamples: ${command.examples?.map(e => `${e.command} — ${e.description}`).join('; ')}`;
      const res = await fetch('/api/chat/message', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: q,
          lessonId: `command-${command.id}`,
          systemContext: `You are Kai, a cybersecurity AI instructor at Firebox Academy. The user is asking about the "${command.name}" command. Here is the reference info:\n\n${context}\n\nGive a clear, practical explanation. Use examples. Keep it concise but thorough. If relevant, mention security implications.`,
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || data.error || 'Sorry, I had trouble responding.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  };

  const quickQs = [
    `Explain each flag for ${command.name}`,
    `Show me a real-world security example`,
    `What are common mistakes?`,
    `How does this relate to CTFs?`,
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '640px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', display: 'flex', flexDirection: 'column',
        height: 'min(85vh, 600px)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(249,115,22,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
            }}>🤖</div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Ask Kai about <code style={{ color: 'var(--primary)', fontSize: '0.88rem' }}>{command.name}</code></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                Kai Online
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '0.25rem' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-start',
            }}>
              {msg.role === 'assistant' && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
              )}
              <div style={{
                maxWidth: '85%', background: msg.role === 'user' ? 'var(--primary)' : 'var(--card)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                padding: '0.65rem 0.9rem', fontSize: '0.85rem', lineHeight: 1.65,
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🤖</div>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '0.65rem 0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0,1,2].map(n => <div key={n} className="typing-dot" style={{ animationDelay: `${n*0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {quickQs.map(q => (
            <button key={q} onClick={() => send(q)} style={{
              background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: '999px', color: 'var(--text-muted)', cursor: 'pointer',
              fontSize: '0.72rem', padding: '0.25rem 0.65rem',
            }}>{q}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={`Ask about ${command.name}...`}
            style={{
              flex: 1, background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.6rem 0.9rem',
              color: 'var(--text)', fontSize: '0.88rem', outline: 'none',
            }}
          />
          <button onClick={() => send()} disabled={loading || !question.trim()} style={{
            background: 'var(--primary)', border: 'none', borderRadius: '8px',
            color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
            padding: '0 1rem', fontSize: '0.85rem', fontWeight: 700, opacity: loading ? 0.6 : 1,
          }}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CommandsLibrary ─────────────────────────────────────────────────────
export default function CommandsLibrary({ user, onLogout, onBack, learnedCommands, onToggleLearned }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [askKaiCmd, setAskKaiCmd] = useState(null);

  const learnedSet = new Set(learnedCommands || []);
  const totalCmds = commands.length;
  const learnedCount = commands.filter(c => learnedSet.has(c.id)).length;
  const xpEarned = commands.filter(c => learnedSet.has(c.id)).reduce((sum, c) => sum + c.xp, 0);

  const filtered = commands.filter(cmd => {
    const matchesCat = category === 'all' || cmd.category === category;
    const q = search.toLowerCase();
    const matchesSearch = !q || cmd.name.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,10,20,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0.85rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <button onClick={onBack} style={{
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: '0.4rem 0.75rem', color: 'var(--text-muted)', cursor: 'pointer',
          fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ← Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>💻</span>
          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
            Interactive <span style={{ color: 'var(--primary)' }}>Commands</span>
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>⚡ {xpEarned} XP</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{learnedCount}/{totalCmds} learned</div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* Left column — search + list */}
        <div style={{ width: 'min(100%, 340px)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Stats */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '1rem', display: 'flex', gap: '0.75rem',
          }}>
            {[
              { label: 'Learned', value: `${learnedCount}/${totalCmds}`, color: 'var(--primary)' },
              { label: 'XP earned', value: `⚡ ${xpEarned}`, color: 'var(--secondary)' },
              { label: 'Progress', value: `${Math.round((learnedCount / totalCmds) * 100)}%`, color: 'var(--success)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', background: 'var(--card)', borderRadius: '8px', padding: '0.5rem 0.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--border)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, var(--primary), #ef4444)', width: `${(learnedCount / totalCmds) * 100}%`, transition: 'width 0.4s' }} />
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem', pointerEvents: 'none' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search commands..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.6rem 0.9rem 0.6rem 2.2rem',
                color: 'var(--text)', fontSize: '0.88rem', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {CATEGORIES.map(cat => {
              const count = cat.id === 'all' ? commands.length : commands.filter(c => c.category === cat.id).length;
              const learnedInCat = cat.id === 'all'
                ? learnedCount
                : commands.filter(c => c.category === cat.id && learnedSet.has(c.id)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem', borderRadius: '8px',
                    background: category === cat.id ? 'rgba(249,115,22,0.12)' : 'transparent',
                    border: `1px solid ${category === cat.id ? 'var(--primary)' : 'transparent'}`,
                    color: category === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                    fontSize: '0.85rem', fontWeight: category === cat.id ? 700 : 400,
                  }}
                >
                  <span>{cat.icon} {cat.label}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{learnedInCat}/{count}</span>
                </button>
              );
            })}
          </div>

          {/* Command list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>No commands found</div>
            )}
            {filtered.map(cmd => {
              const isActive = selected?.id === cmd.id;
              const diff = DIFFICULTY_COLOR[cmd.difficulty] || DIFFICULTY_COLOR.Beginner;
              return (
                <button
                  key={cmd.id}
                  onClick={() => setSelected(cmd)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem', borderRadius: '8px',
                    background: isActive ? 'rgba(249,115,22,0.1)' : 'var(--card)',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                    borderLeft: `3px solid ${isActive ? 'var(--primary)' : diff.color}`,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'var(--card)'; }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <code style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.85rem', color: isActive ? 'var(--primary)' : 'var(--text)', fontWeight: 700 }}>
                        {cmd.name}
                      </code>
                      {learnedSet.has(cmd.id) && <span style={{ color: 'var(--success)', fontSize: '0.7rem' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                      {cmd.description.slice(0, 50)}…
                    </div>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: diff.color, fontWeight: 600, flexShrink: 0, marginLeft: '0.5rem' }}>
                    {cmd.difficulty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column — detail */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <CommandDetail
              command={selected}
              learnedSet={learnedSet}
              onToggleLearned={onToggleLearned}
              onAskKai={setAskKaiCmd}
            />
          ) : (
            <div style={{
              height: '60vh', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', textAlign: 'center',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💻</div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--text)' }}>Select a Command</h2>
              <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '280px', lineHeight: 1.6 }}>
                Choose a command from the list to see its syntax, flags, examples, and practice in the terminal.
              </p>
            </div>
          )}
        </div>
      </div>

      {askKaiCmd && (
        <AskKaiModal command={askKaiCmd} onClose={() => setAskKaiCmd(null)} />
      )}
    </div>
  );
}
