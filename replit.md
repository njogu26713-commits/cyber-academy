# Firebox Cyber Academy

An AI-powered cybersecurity learning platform where every student has a personal AI instructor named **Kai**.

## Stack
- **Backend**: Node.js + Express (port 3001)
- **Frontend**: React + Vite (port 5000)
- **Database**: MongoDB via Mongoose (falls back to in-memory session mode when `MONGODB_URI` is absent)
- **AI**: Groq `llama-3.3-70b-versatile` through the OpenAI-compatible package
- **Auth**: `express-session` + `connect-mongo` + `bcryptjs`

## Running the App
```bash
npm run dev
```
This starts both the Vite dev server (port 5000, user-facing) and the Express API (port 3001) using `concurrently`.

## Required Secrets
- `GROQ_API_KEY` — Groq API key for Kai's AI responses
- `MONGODB_URI` — MongoDB connection string for persistent users, messages, and progress
- `SESSION_SECRET` — Already configured

## Project Structure
```
server/
  index.js          # Express entry point (port 3001)
  db.js             # MongoDB connection and Mongoose models
  curriculum.js     # Full 8-module curriculum definition
  routes/
    auth.js         # Register, login, logout, /me
    chat.js         # AI chat, lesson start, history
    progress.js     # Lesson progress, quiz results
client/
  index.html
  src/
    App.jsx         # Root + auth context
    pages/
      Landing.jsx   # Marketing landing page
      Auth.jsx      # Login/register
      Learn.jsx     # Main learning layout
    components/
      Sidebar.jsx       # Curriculum nav + progress
      ChatInterface.jsx # AI conversation UI
      QuizModal.jsx     # Interactive quiz popup
```

## Key Design Decisions
- Vite on port 5000 (webview), proxies `/api/*` to Express on 3001
- MongoDB stores users, lesson progress, quiz results, and Kai conversations
- Quiz responses are embedded by the AI inside `[QUIZ]...[/QUIZ]` tags and parsed by the frontend
- Each user has per-lesson conversation history stored in the DB
- The public Kai demo works without authentication; full lessons require a configured database and Groq key

## User Preferences
- Keep the dark cyberpunk theme (fire/ember color palette: primary `#f97316`)
- AI persona name: **Kai**
