import React, { useState } from 'react';

const levelColor = {
  Beginner: 'badge-beginner',
  Intermediate: 'badge-intermediate',
  Advanced: 'badge-advanced',
};

function statusIcon(status) {
  if (status === 'completed') return '✅';
  if (status === 'in_progress') return '🔄';
  return '○';
}

export default function Sidebar({ curriculum, progress, activeLesson, onSelectLesson, user, onLogout }) {
  const [expanded, setExpanded] = useState(() => {
    // Expand first module by default
    const ids = new Set();
    if (curriculum[0]) ids.add(curriculum[0].id);
    return ids;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const progressMap = {};
  if (progress?.lessons) {
    progress.lessons.forEach(l => { progressMap[l.lesson_id] = l.status; });
  }

  const completedCount = Object.values(progressMap).filter(s => s === 'completed').length;
  const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);

  const toggleModule = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sidebar = (
    <aside style={{
      width: '280px', minWidth: '280px', background: 'var(--surface)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem 1rem', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🔥</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Firebox <span style={{ color: 'var(--primary)' }}>Academy</span>
          </span>
        </div>
        <button onClick={() => setSidebarOpen(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', display: window.innerWidth < 768 ? 'block' : 'none' }}>
          ✕
        </button>
      </div>

      {/* User + Progress */}
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: '#fff',
            }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.username}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{completedCount}/{totalLessons} lessons</div>
            </div>
          </div>
          <button onClick={onLogout} title="Sign out"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
            ⎋
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--border)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '999px',
            background: 'linear-gradient(90deg, var(--primary), #ef4444)',
            width: `${totalLessons ? (completedCount / totalLessons) * 100 : 0}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          {Math.round(totalLessons ? (completedCount / totalLessons) * 100 : 0)}% complete
        </div>
      </div>

      {/* Curriculum */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {curriculum.map((module, mi) => {
          const isOpen = expanded.has(module.id);
          const moduleDone = module.lessons.filter(l => progressMap[l.id] === 'completed').length;
          return (
            <div key={module.id}>
              <button
                onClick={() => toggleModule(module.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.7rem 1rem', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text)', textAlign: 'left',
                  borderTop: mi > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <span>{module.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {module.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {moduleDone}/{module.lessons.length} • <span className={`badge ${levelColor[module.level]}`} style={{ padding: '0 0.35em', fontSize: '0.68rem' }}>{module.level}</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem', flexShrink: 0 }}>
                  {isOpen ? '▾' : '▸'}
                </span>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                  {module.lessons.map(lesson => {
                    const status = progressMap[lesson.id] || 'not_started';
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => { onSelectLesson(lesson, module); setSidebarOpen(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                          padding: '0.55rem 1rem 0.55rem 2rem',
                          background: isActive ? 'var(--primary-glow)' : 'none',
                          border: 'none', borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                          cursor: 'pointer', color: isActive ? 'var(--text)' : 'var(--text-dim)',
                          textAlign: 'left', transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                      >
                        <span style={{ fontSize: '0.75rem', width: '16px', textAlign: 'center', flexShrink: 0 }}>
                          {statusIcon(status)}
                        </span>
                        <span style={{ fontSize: '0.82rem', lineHeight: 1.3 }}>{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 200,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '0.5rem 0.7rem',
          color: 'var(--text)', cursor: 'pointer', fontSize: '1rem',
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Desktop sidebar */}
      <div style={{ display: 'flex' }} className="sidebar-desktop">
        {sidebar}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
