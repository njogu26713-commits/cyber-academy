```jsx
import React, { useState, useEffect } from 'react';
import KaiTeacher from '../components/KaiTeacher.jsx';
import CourseHome from '../components/CourseHome.jsx';
import ModuleDetail from '../components/ModuleDetail.jsx';
import CommandsChat from '../components/CommandsChat.jsx';
import { commands as ALL_COMMANDS } from '../data/commands';

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
        const res = await fetch('/api/curriculum', {
          credentials: 'include',
        });

        if (!res.ok) return;

        const data = await res.json();

        if (!mounted) return;

        setCurriculum(data.curriculum || []);
      } catch (err) {
        console.error('Failed to load curriculum', err);
      } finally {
        if (mounted) {
          setLoadingCurriculum(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Ask Kai to explain a command
  const onAskKai = async (params) => {
    try {
      const res = await fetch('/api/chat/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commandId: params.commandId,
          prompt: params.prompt,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        throw new Error(
          data.error || `Request failed (${res.status})`
        );
      }

      const data = await res.json();

      return data.reply;
    } catch (error) {
      console.error('Kai explanation error:', error);
      throw error;
    }
  };

  // Open a module
  const handleOpenModule = (module) => {
    setSelectedModule(module);
    setView('module');
  };

  // Return to course home
  const goHome = () => {
    setSelectedModule(null);
    setView('home');
  };

  // Open Commands
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

  // Open selected module
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

  // Open Kai
  if (view === 'kai') {
    return (
      <KaiTeacher
        user={user}
        onBack={goHome}
        onLogout={logout}
      />
    );
  }

  // Course home
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
```
