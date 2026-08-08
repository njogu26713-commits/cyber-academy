import React, { useState, useEffect } from 'react';
import KaiTeacher from '../components/KaiTeacher.jsx';
import CourseHome from '../components/CourseHome.jsx';
import ModuleDetail from '../components/ModuleDetail.jsx';
import CommandsChat from '../components/CommandsChat.jsx';

const Learn = ({
  user,
  logout,
  handleBackToHome,
  learnedCommands = [],
  handleToggleLearned,
}) => {
  const [view, setView] = useState('home');
  const [selectedModule, setSelectedModule] = useState(null);

  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState({ lessons: [] });
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/curriculum', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setCurriculum(data.curriculum || []);
      } catch (err) {
        // ignore — fall back to empty curriculum
        console.error('Failed to load curriculum', err);
      } finally {
        if (mounted) setLoadingCurriculum(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const onAskKai = async (cmd, onProgress) => {
    try {
      const res = await fetch('/api/kai/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commandId: cmd.id,
          prompt: cmd.text,
        }),
        credentials: 'include',
      });

      if (res.ok && res.body && typeof onProgress === 'function') {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();

          if (value) {
            const chunk = decoder.decode(value, {
              stream: true,
            });

            onProgress(chunk);
          }

          if (done) {
            break;
          }
        }

        return;
      }

      return await res.text();
    } catch (error) {
      console.error('Kai explanation error:', error);
      throw error;
    }
  };

  const handleOpenModule = (module) => {
    setSelectedModule(module);
    setView('module');
  };

  const goHome = () => {
    setSelectedModule(null);
    setView('home');
  };

  if (view === 'commands') {
    return (
      <CommandsChat
        user={user}
        onLogout={logout}
        onBack={handleBackToHome || goHome}
        learnedCommands={learnedCommands}
        onToggleLearned={handleToggleLearned}
        onAskKai={onAskKai}
      />
    );
  }

  if (view === 'module' && selectedModule) {
    return (
      <ModuleDetail
        module={selectedModule}
        curriculum={curriculum}
        progressMap={progress}
        user={user}
        onBack={goHome}
        onLogout={logout}
      />
    );
  }

  if (view === 'kai') {
    return (
      <KaiTeacher
        user={user}
        onBack={goHome}
        onLogout={logout}
      />
    );
  }

  // While loading curriculum, show CourseHome with empty data so the app doesn't crash
  return (
    <CourseHome
      curriculum={curriculum}
      progress={progress}
      user={user}
      onLogout={logout}
      onOpenModule={handleOpenModule}
      onOpenCommands={() => setView('commands')}
      onOpenKai={() => setView('kai')}
      learnedCommands={learnedCommands}
    />
  );
};

export default Learn;
