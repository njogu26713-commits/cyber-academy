import React, { useState } from 'react';

const LEVEL_CONFIG = {
  Beginner:     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: '🟢' },
  Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
  Advanced:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '🔴' },
};
const XP_PER_LESSON = 100;
const MINS_PER_LESSON = 15;

function getModuleProgress(module, progressMap) {
  const completed = module.lessons.filter(l => progressMap[l.id] === 'completed').length;
  const inProgress = module.lessons.filter(l => progressMap[l.id] === 'in_progress').length;
  return { completed, inProgress, total: module.lessons.length };
}

function isModuleLocked(modules, moduleIndex, progressMap) {
  if (moduleIndex === 0) return false;
  const prev = modules[moduleIndex - 1];
  const { completed } = getModuleProgress(prev, progressMap);
  return completed === 0;
}

function getModuleStatus(module, progressMap) {
  const { completed, total } = getModuleProgress(module, progressMap);
  if (completed === total) return 'completed';
  if (completed > 0) return 'in_progress';
  const hasInProgress = module.lessons.some(l => progressMap[l.id] === 'in_progress');
  if (hasInProgress) return 'in_progress';
  return 'not_started';
}

function ModuleCard({ module, moduleIndex, modules, progressMap, onOpen, hovered, onHover }) {
  const locked = isModuleLocked(modules, moduleIndex, progressMap);
  const { completed, total } = getModuleProgress(module, progressMap);
  const status = getModuleStatus(module, progressMap);
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const lvl = LEVEL_CONFIG[module.level] || LEVEL_CONFIG.Beginner;
  const earnedXP = completed * XP_PER_LESSON;
  const totalXP = total * XP_PER_LESSON;
  const estMins = total * MINS_PER_LESSON;
  const isHovered = hovered === module.id;

  let btnLabel = 'Start Learning';
  if (status === 'completed') btnLabel = '✓ Review';
  else if (status === 'in_progress') btnLabel = '▶ Continue';

  return (
    <div
      onMouseEnter={() => onHover(module.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => !locked && onOpen(module)}
      style={{
        background: 'var(--card)',
        border: `1px solid ${isHovered && !locked ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '14px',
        padding: '1.5rem',
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.55 : 1,
        transform: isHovered && !locked ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.18s ease',
        boxShadow: isHovered && !locked
          ? '0 8px 32px rgba(249,115,22,0.18), 0 0 0 1px rgba(249,115,22,0.2)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top glow accent */}
      {isHovered && !locked && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: locked ? 'rgba(255,255,255,0.05)' : lvl.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', flexShrink: 0,
          }}>
            {locked ? '🔒' : module.icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
              {module.title}
            </h3>
            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                borderRadius: '999px', background: lvl.bg, color: lvl.color,
                letterSpacing: '0.02em',
              }}>
                {module.level}
              </span>
              {status === 'completed' && (
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>✓ Complete</span>
              )}
              {locked && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Complete previous module to unlock</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { icon: '📚', label: `${total} lessons` },
          { icon: '⏱', label: `~${estMins} min` },
          { icon: '⚡', label: `${totalXP} XP` },
          { icon: '🤖', label: 'AI Tutor' },
        ].map(({ icon, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.8rem' }}>{icon}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Progress section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {completed}/{total} lessons completed
          </span>
          <span style={{ fontSize: '0.72rem', color: pct > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}>
            {pct}%
          </span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '999px',
            background: status === 'completed'
              ? 'linear-gradient(90deg, var(--success), #16a34a)'
              : 'linear-gradient(90deg, var(--primary), #ef4444)',
            width: `${pct}%`,
            transition: 'width 0.6s ease',
          }} />
        </div>
        {earnedXP > 0 && (
          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.3rem', fontWeight: 600 }}>
            ⚡ {earnedXP} / {totalXP} XP earned
          </div>
        )}
      </div>

      {/* CTA button */}
      {!locked && (
        <div style={{
          marginTop: 'auto',
          padding: '0.55rem 1rem',
          borderRadius: '8px',
          background: status === 'completed'
            ? 'rgba(34,197,94,0.12)'
            : isHovered
              ? 'var(--primary)'
              : 'rgba(249,115,22,0.12)',
          color: status === 'completed' ? 'var(--success)' : isHovered ? '#fff' : 'var(--primary)',
          border: `1px solid ${status === 'completed' ? 'var(--success)' : 'var(--primary)'}`,
          fontSize: '0.82rem',
          fontWeight: 700,
          textAlign: 'center',
          transition: 'all 0.18s',
          letterSpacing: '0.02em',
        }}>
          {btnLabel}
        </div>
      )}
    </div>
  );
}

export default function CourseHome({ curriculum, progress, user, onLogout, onOpenModule }) {
  const [filter, setFilter] = useState('All');
  const [hovered, setHovered] = useState(null);

  const progressMap = {};
  if (progress?.lessons) {
    progress.lessons.forEach(l => { progressMap[l.lesson_id] = l.status; });
  }

  const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = curriculum.reduce((sum, m) => {
    return sum + m.lessons.filter(l => progressMap[l.id] === 'completed').length;
  }, 0);
  const totalXP = completedLessons * XP_PER_LESSON;
  const overallPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = filter === 'All' ? curriculum : curriculum.filter(m => m.level === filter);

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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🔥</span>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            Firebox <span style={{ color: 'var(--primary)' }}>Academy</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: '#fff',
            }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'var(--nav-name-display, block)' }}>
              {user?.username}
            </span>
          </div>
          <button onClick={onLogout} style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem',
            padding: '0.3rem 0.65rem',
          }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* Hero stats */}
        <div style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, rgba(249,115,22,0.06) 100%)',
          border: '1px solid var(--border)', borderRadius: '16px',
          padding: '1.75rem 2rem', marginBottom: '2rem',
          display: 'flex', flexWrap: 'wrap', gap: '1.5rem',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem', fontSize: 'clamp(1.3rem, 4vw, 1.75rem)', fontWeight: 800 }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.username}</span> 👋
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Keep hacking — you're {overallPct}% through the academy.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Lessons done', value: `${completedLessons}/${totalLessons}`, color: 'var(--text)' },
              { label: 'XP earned', value: `⚡ ${totalXP}`, color: 'var(--primary)' },
              { label: 'Progress', value: `${overallPct}%`, color: 'var(--secondary)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '0.75rem 1.1rem', textAlign: 'center', minWidth: '90px',
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'var(--border)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '999px',
              background: 'linear-gradient(90deg, var(--primary), #ef4444)',
              width: `${overallPct}%`, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                padding: '0.45rem 1rem', borderRadius: '999px',
                background: filter === lvl ? 'var(--primary)' : 'var(--card)',
                border: `1px solid ${filter === lvl ? 'var(--primary)' : 'var(--border)'}`,
                color: filter === lvl ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {lvl === 'Beginner' ? '🟢' : lvl === 'Intermediate' ? '🟡' : lvl === 'Advanced' ? '🔴' : '📋'} {lvl}
            </button>
          ))}
        </div>

        {/* Course grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: '1.25rem',
        }}>
          {filtered.map((module, i) => {
            const realIndex = curriculum.indexOf(module);
            return (
              <ModuleCard
                key={module.id}
                module={module}
                moduleIndex={realIndex}
                modules={curriculum}
                progressMap={progressMap}
                onOpen={onOpenModule}
                hovered={hovered}
                onHover={setHovered}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
