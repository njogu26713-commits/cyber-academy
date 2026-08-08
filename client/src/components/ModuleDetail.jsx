import React from 'react';

const LEVEL_CONFIG = {
  Beginner:     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Advanced:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};
const XP_PER_LESSON = 100;
const MINS_PER_LESSON = 15;

function statusIcon(status) {
  if (status === 'completed') return { icon: '✓', color: 'var(--success)', bg: 'rgba(34,197,94,0.15)' };
  if (status === 'in_progress') return { icon: '▶', color: 'var(--secondary)', bg: 'rgba(59,130,246,0.15)' };
  return { icon: '○', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' };
}

export default function ModuleDetail({ module, curriculum, progressMap, onSelectLesson, onBack }) {
  if (!module) return null;

  const lvl = LEVEL_CONFIG[module.level] || LEVEL_CONFIG.Beginner;
  const completed = module.lessons.filter(l => progressMap[l.id] === 'completed').length;
  const total = module.lessons.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  // Find first non-completed lesson to continue from
  const continueLesson = module.lessons.find(l => progressMap[l.id] !== 'completed');

  // Is this module locked?
  const moduleIndex = curriculum.indexOf(module);
  const isLocked = moduleIndex > 0 && (() => {
    const prev = curriculum[moduleIndex - 1];
    return prev.lessons.filter(l => progressMap[l.id] === 'completed').length === 0;
  })();

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', overflowY: 'auto',
      fontFamily: 'var(--sans)',
    }}>
      {/* Top nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,10,20,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0.85rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.4rem 0.75rem',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🔥</span>
          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
            Firebox <span style={{ color: 'var(--primary)' }}>Academy</span>
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* Module header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--surface), rgba(249,115,22,0.05))',
          border: '1px solid var(--border)', borderRadius: '16px',
          padding: '1.75rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '14px',
              background: lvl.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '2rem', flexShrink: 0,
            }}>
              {isLocked ? '🔒' : module.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800 }}>
                  {module.title}
                </h1>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                  borderRadius: '999px', background: lvl.bg, color: lvl.color,
                }}>
                  {module.level}
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {[
                  { icon: '📚', text: `${total} lessons` },
                  { icon: '⏱', text: `~${total * MINS_PER_LESSON} min` },
                  { icon: '⚡', text: `${total * XP_PER_LESSON} XP total` },
                  { icon: '🤖', text: 'AI Tutor: Kai' },
                ].map(({ icon, text }) => (
                  <span key={text} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {icon} {text}
                  </span>
                ))}
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completed}/{total} completed</span>
                  <span style={{ fontSize: '0.75rem', color: pct > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '999px',
                    background: pct === 100
                      ? 'linear-gradient(90deg, var(--success), #16a34a)'
                      : 'linear-gradient(90deg, var(--primary), #ef4444)',
                    width: `${pct}%`, transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Continue button */}
          {!isLocked && continueLesson && (
            <button
              onClick={() => onSelectLesson(continueLesson, module)}
              style={{
                marginTop: '1.25rem', width: '100%',
                padding: '0.75rem', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), #ef4444)',
                border: 'none', color: '#fff', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.02em',
                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {completed > 0 ? '▶ Continue Learning' : '🚀 Start Module'}
            </button>
          )}

          {isLocked && (
            <div style={{
              marginTop: '1.25rem', padding: '0.75rem', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem',
            }}>
              🔒 Complete the previous module to unlock this one
            </div>
          )}
        </div>

        {/* Lessons list */}
        <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Lessons
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {module.lessons.map((lesson, i) => {
            const status = progressMap[lesson.id] || 'not_started';
            const { icon, color, bg } = statusIcon(status);
            const isCompleted = status === 'completed';
            const canStart = !isLocked;

            return (
              <div
                key={lesson.id}
                onClick={() => canStart && onSelectLesson(lesson, module)}
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '1.1rem 1.25rem',
                  cursor: canStart ? 'pointer' : 'not-allowed',
                  opacity: isLocked ? 0.5 : 1,
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                }}
                onMouseEnter={e => {
                  if (!isLocked) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background = 'rgba(249,115,22,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--card)';
                }}
              >
                {/* Number / status badge */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: bg, color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: isCompleted ? '0.9rem' : '0.82rem',
                  fontWeight: 700, flexShrink: 0,
                }}>
                  {isCompleted ? icon : i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{
                      margin: 0, fontSize: '0.92rem', fontWeight: 700,
                      color: isCompleted ? 'var(--success)' : 'var(--text)',
                    }}>
                      {lesson.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>⏱ ~{MINS_PER_LESSON} min</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>⚡ {XP_PER_LESSON} XP</span>
                    </div>
                  </div>
                  <p style={{ margin: '0.3rem 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {lesson.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {lesson.topics.slice(0, 3).map(t => (
                      <span key={t} style={{
                        fontSize: '0.68rem', padding: '0.15rem 0.5rem',
                        borderRadius: '999px', background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        {t}
                      </span>
                    ))}
                    {lesson.topics.length > 3 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '0.15rem 0.3rem' }}>
                        +{lesson.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
