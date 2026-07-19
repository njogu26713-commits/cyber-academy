# Firebox Cyber Academy

An AI-powered cybersecurity learning platform where every student has a personal AI instructor named **Kai**.

## Stack
- **Backend**: Node.js + Express (port 3001)
- **Frontend**: React + Vite (port 5000)
- **Database**: SQLite via `better-sqlite3` (stored in `data/`)
- **AI**: OpenAI GPT-4o via the `openai` npm package
- **Auth**: `express-session` + `connect-sqlite3` + `bcryptjs`

## Running the App
```bash
npm run dev
```
This starts both the Vite dev server (port 5000, user-facing) and the Express API (port 3001) using `concurrently`.

## Required Secrets
- `OPENAI_API_KEY` — OpenAI API key for the AI instructor (GPT-4o)
- `SESSION_SECRET` — Already configured

## Project Structure
```
server/
  index.js          # Express entry point (port 3001)
  db.js             # SQLite database setup
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
data/                   # SQLite DB files (gitignored)
```

## Key Design Decisions
- Vite on port 5000 (webview), proxies `/api/*` to Express on 3001
- SQLite for zero-config persistence — no external DB needed
- Quiz responses are embedded by the AI inside `[QUIZ]...[/QUIZ]` tags and parsed by the frontend
- Each user has per-lesson conversation history stored in the DB

## User Preferences
- Keep the dark cyberpunk theme (fire/ember color palette: primary `#f97316`)
- AI persona name: **Kai**
