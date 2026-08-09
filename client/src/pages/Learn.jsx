import React, { useEffect, useState } from 'react';
import { useAuth } from '../App.jsx';
import KaiTeacher from '../components/KaiTeacher.jsx';
import CourseHome from '../components/CourseHome.jsx';
import ModuleDetail from '../components/ModuleDetail.jsx';
import CommandsChat from '../components/CommandsChat.jsx';

export default function Learn({
  user,
  logout,
  handleBackToHome,
  learnedCommands = [],
  handleToggleLearned,
}) {
  const auth = useAuth();
  const currentUser = user || auth?.user;
  const handleLogout = logout || auth?.logout;

  const [view, setView] = useState('home');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState({ lessons: [] });
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [curriculumRes, progressRes] = await Promise.all([
          fetch('/api/curriculum', { credentials: 'include' }),
          fetch('/api/progress', { credentials: 'include' }),
        ]);

        if (!curriculumRes.ok) {
          throw new Error(`Curriculum request failed (${curriculumRes.status})`);
        }

        const curriculumData = await curriculumRes.json();
        if (!mounted) return;

        setCurriculum(curriculumData.curriculum || []);
        if (progressRes.ok) {
          setProgress(await progressRes.json());
        }
      } catch (error) {
        console.error('Failed to load curriculum:', error);
      } finally {
        if (mounted) setLoadingCurriculum(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const onAskKai = async ({ commandId, prompt }) => {
    const response = await fetch('/api/chat/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ commandId, prompt }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data.reply;
  };

  const handleOpenModule = (module) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    setView('module');
  };

  const handleSelectLesson = (lesson, module) => {
    setSelectedModule(module);
    setSelectedLesson(lesson);
    setView('kai');
  };

  const goHome = () => {
    setSelectedModule(null);
    setSelectedLesson(null);
    setView('home');
  };

  if (view === 'commands') {
    return (
      <CommandsChat
        user={currentUser}
        onLogout={handleLogout}
        onBack={handleBackToHome || goHome}
        learnedCommands={learnedCommands}
        onToggleLearned={handleToggleLearned}
        onAskKai={onAskKai}
      />
    );
  }

  if (view === 'module' && selectedModule) {
    const progressMap = Object.fromEntries(
      (progress.lessons || []).map(item => [item.lesson_id, item.status])
    );

    return (
      <ModuleDetail
        module={selectedModule}
        curriculum={curriculum}
        progressMap={progressMap}
        onSelectLesson={handleSelectLesson}
        onBack={goHome}
      />
    );
  }

  if (view === 'kai' && selectedLesson) {
    return (
      <KaiTeacher
        lesson={selectedLesson}
        module={selectedModule}
        onBack={() => setView('module')}
        onBackToModule={() => setView('module')}
      />
    );
  }

  return (
    <CourseHome
      curriculum={curriculum}
      progress={progress}
      user={currentUser}
      onLogout={handleLogout}
      onOpenModule={handleOpenModule}
      onOpenCommands={() => setView('commands')}
      learnedCommands={learnedCommands}
      loading={loadingCurriculum}
    />
  );
}