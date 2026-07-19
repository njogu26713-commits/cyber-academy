import React, { useState, useEffect } from 'react';
import { useAuth } from '../App.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatInterface from '../components/ChatInterface.jsx';
import CourseHome from '../components/CourseHome.jsx';
import ModuleDetail from '../components/ModuleDetail.jsx';
import CommandsLibrary from '../components/CommandsLibrary.jsx';

export default function Learn() {
  const { user, logout } = useAuth();
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState({ lessons: [], quizStats: [] });
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [view, setView] = useState('home'); // 'home' | 'module' | 'lesson' | 'commands'
  const [selectedModule, setSelectedModule] = useState(null);
  const [learnedCommands, setLearnedCommands] = useState(() => {
    try { return JSON.parse(localStorage.getItem('firebox_learned_cmds') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    fetch('/api/curriculum', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setCurriculum(data.curriculum || []))
      .catch(() => {});
    loadProgress();
  }, []);

  const loadProgress = () => {
    fetch('/api/progress', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setProgress(data))
      .catch(() => {});
  };

  const progressMap = {};
  if (progress?.lessons) {
    progress.lessons.forEach(l => { progressMap[l.lesson_id] = l.status; });
  }

  const handleOpenModule = (module) => {
    setSelectedModule(module);
    setView('module');
  };

  const handleSelectLesson = (lesson, module) => {
    setActiveLesson(lesson);
    setActiveModule(module);
    setView('lesson');
  };

  const handleBackToHome = () => {
    setSelectedModule(null);
    setView('home');
  };

  const handleBackToModule = () => {
    setView('module');
  };

  const handleToggleLearned = (cmdId) => {
    setLearnedCommands(prev => {
      const next = prev.includes(cmdId) ? prev.filter(id => id !== cmdId) : [...prev, cmdId];
      localStorage.setItem('firebox_learned_cmds', JSON.stringify(next));
      return next;
    });
  };

  // Commands library
  if (view === 'commands') {
    return (
      <CommandsLibrary
        user={user}
        onLogout={logout}
        onBack={handleBackToHome}
        learnedCommands={learnedCommands}
        onToggleLearned={handleToggleLearned}
      />
    );
  }

  // Home: course card grid
  if (view === 'home') {
    return (
      <CourseHome
        curriculum={curriculum}
        progress={progress}
        user={user}
        onLogout={logout}
        onOpenModule={handleOpenModule}
        onOpenCommands={() => setView('commands')}
      />
    );
  }

  // Module detail: lesson list
  if (view === 'module') {
    return (
      <ModuleDetail
        module={selectedModule}
        curriculum={curriculum}
        progressMap={progressMap}
        onSelectLesson={handleSelectLesson}
        onBack={handleBackToHome}
      />
    );
  }

  // Lesson: chat with Kai
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        curriculum={curriculum}
        progress={progress}
        activeLesson={activeLesson}
        onSelectLesson={handleSelectLesson}
        user={user}
        onLogout={logout}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Back button strip */}
        <div style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <button
            onClick={handleBackToModule}
            style={{
              background: 'none', border: 'none', color: 'var(--primary)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              padding: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            ← {activeModule?.title || 'Back'}
          </button>
          {activeLesson && (
            <>
              <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>›</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{activeLesson.title}</span>
            </>
          )}
        </div>
        <ChatInterface
          lesson={activeLesson}
          module={activeModule}
          onProgressUpdate={loadProgress}
        />
      </main>
    </div>
  );
}
