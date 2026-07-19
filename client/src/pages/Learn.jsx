import React, { useState, useEffect } from 'react';
import { useAuth } from '../App.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatInterface from '../components/ChatInterface.jsx';

export default function Learn() {
  const { user, logout } = useAuth();
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState({ lessons: [], quizStats: [] });
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);

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

  const handleSelectLesson = (lesson, module) => {
    setActiveLesson(lesson);
    setActiveModule(module);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile overlay sidebar — handled inside Sidebar component */}
      <Sidebar
        curriculum={curriculum}
        progress={progress}
        activeLesson={activeLesson}
        onSelectLesson={handleSelectLesson}
        user={user}
        onLogout={logout}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <ChatInterface
          lesson={activeLesson}
          module={activeModule}
          onProgressUpdate={loadProgress}
        />
      </main>
    </div>
  );
}
