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

// This is called by CommandsLibrary/CommandsChat with { commandId, prompt }
const onAskKai = async (params) => {
try {
const res = await fetch('/api/chat/explain', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
commandId: params.commandId,
prompt: params.prompt,
}),
credentials: 'include',
});

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
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
```jsx

);


}

if (view === 'kai') {
return (

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
