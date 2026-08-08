```jsx
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

    const loadCurriculum = async () => {
      try {
        const res = await fetch('/api/curriculum', {
          credentials: 'include',
        });

        if (!res.ok) {
          console.error('Curriculum request failed:', res.status);
          return;
        }

        const data = await res.json();

        if (mounted) {
          setCurriculum(data.curriculum || []);
        }
      } catch (err) {
        console.error('Failed to load curriculum:', err);
      } finally {
        if (mounted) {
          setLoadingCurriculum(false);
        }
      }
    };

    loadCurriculum();

    return () => {
      mounted = false;
    };
  }, []);

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
          data.error || 'Request failed (' + res.status + ')'
        );
      }

      const data = await res.json();
      return data.reply;
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

  const goToCommands = () => {
    setView('commands');
  };

  const goToKai = () => {
    setView('kai');
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

  return (
    <CourseHome
      curriculum={curriculum}
      progress={progress}
      user={user}
      onLogout={logout}
      onOpenModule={handleOpenModule}
      onOpenCommands={goToCommands}
      onOpenKai={goToKai}
      learnedCommands={learnedCommands}
    />
  );
};

export default Learn;
```
