import React from 'react';

const features = [
  { icon: '🤖', title: 'AI-Powered Instructor', desc: 'Kai, your personal AI tutor, teaches every topic conversationally — like a 1-on-1 session.' },
  { icon: '📈', title: 'Adaptive Learning', desc: 'Lessons adapt to your skill level. Struggle? Kai rephrases. Flying through? It challenges you.' },
  { icon: '🎯', title: 'Interactive Quizzes', desc: 'Get tested after every lesson with AI-generated quizzes and detailed explanations.' },
  { icon: '🗺️', title: 'Structured Curriculum', desc: '8 modules from absolute beginner to advanced — Fundamentals, Linux, Hacking, Cryptography, and more.' },
  { icon: '💡', title: 'Hint-Based Learning', desc: 'Stuck? Get hints that guide your thinking instead of just giving you the answer.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Track completed lessons, quiz scores, and your journey from beginner to expert.' },
];

const modules = [
  { icon: '🛡️', title: 'Cybersecurity Fundamentals', level: 'Beginner' },
  { icon: '🐧', title: 'Linux for Security', level: 'Beginner' },
  { icon: '🌐', title: 'Networking Fundamentals', level: 'Beginner' },
  { icon: '🕸️', title: 'Web Security', level: 'Intermediate' },
  { icon: '💻', title: 'Ethical Hacking', level: 'Intermediate' },
  { icon: '🔐', title: 'Cryptography', level: 'Intermediate' },
  { icon: '🚨', title: 'Incident Response', level: 'Advanced' },
  { icon: '⚡', title: 'Advanced Topics', level: 'Advanced' },
];

const levelColor = { Beginner: 'badge-beginner', Intermediate: 'badge-intermediate', Advanced: 'badge-advanced' };

export default function Landing({ onGetStarted }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.2rem 2rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(5,10,20,0.95)',
        backdropFilter: 'blur(10px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔥</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            Firebox <span style={{ color: 'var(--primary)' }}>Cyber Academy</span>
          </span>
        </div>
        <button className="btn btn-primary" onClick={onGetStarted}>Get Started Free</button>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center', padding: '6rem 2rem 5rem',
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.12), transparent)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: '999px', padding: '0.35rem 1rem', fontSize: '0.8rem',
          color: 'var(--primary)', marginBottom: '1.5rem',
        }}>
          <span>⚡</span> AI-Powered Cybersecurity Education
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800,
          lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.2rem',
          maxWidth: '800px', margin: '0 auto 1.2rem',
        }}>
          Your Personal AI<br />
          <span style={{
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Cybersecurity Instructor</span>
        </h1>

        <p style={{
          fontSize: '1.15rem', color: 'var(--text-dim)', maxWidth: '560px',
          margin: '0 auto 2.5rem', lineHeight: 1.7,
        }}>
          Learn cybersecurity through interactive AI conversations. Kai, your 24/7 AI tutor, 
          teaches, quizzes, and guides you from complete beginner to advanced practitioner.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onGetStarted} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            🔥 Start Learning Free
          </button>
          <button className="btn btn-ghost" onClick={onGetStarted} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
            View Curriculum ↓
          </button>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['8', 'Modules'], ['32+', 'Lessons'], ['24/7', 'AI Tutor'], ['∞', 'Practice']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>{n}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Why Firebox?
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          Traditional courses are passive. Firebox is a conversation.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '1.5rem',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Full Curriculum
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
          A complete path from zero to cybersecurity professional
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {modules.map((m, i) => (
            <div key={m.title} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '1.2rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.6rem' }}>{m.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</span>
              <span className={`badge ${levelColor[m.level]}`}>{m.level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '5rem 2rem',
        background: 'linear-gradient(to bottom, transparent, rgba(249,115,22,0.05))',
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Ready to start your cybersecurity journey?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Join Firebox Cyber Academy and get your own AI instructor today.
        </p>
        <button className="btn btn-primary" onClick={onGetStarted} style={{ fontSize: '1.05rem', padding: '0.85rem 2.5rem' }}>
          🔥 Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border)',
        color: 'var(--text-muted)', fontSize: '0.85rem',
      }}>
        🔥 Firebox Cyber Academy — AI-powered cybersecurity education
      </footer>
    </div>
  );
}
