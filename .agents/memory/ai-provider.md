---
name: AI provider setup
description: Firebox uses Groq for the AI instructor, not OpenAI — important for any future AI-related work
---

The app uses Groq's API, not OpenAI's, for the Kai instructor.

**Rule:** Any AI call in `server/routes/chat.js` must use `GROQ_API_KEY` and `baseURL: 'https://api.groq.com/openai/v1'`. The `openai` npm package is reused with a custom base URL — no separate groq-sdk installed.

**Why:** User switched from OpenAI to Groq during setup. Groq is faster and the API is fully OpenAI-compatible.

**How to apply:** When adding new AI features, instantiate the client as:
```js
new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
```
Model in use: `llama-3.3-70b-versatile`
