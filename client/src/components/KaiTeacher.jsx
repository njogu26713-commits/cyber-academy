import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../App.jsx';

/* ─────────────────────────────────────────────
   TYPING ANIMATION ENGINE
   ───────────────────────────────────────────── */

function injectTypos(text) {
  if (text.length < 30 || Math.random() > 0.55) {
    return { seq: text, typos: [] };
  }

  const typoMap = {
    a: 's', e: 'r', i: 'o', o: 'p', s: 'a', n: 'm',
    t: 'y', h: 'j', l: 'k', r: 'e', g: 'f', c: 'x',
    p: 'o', d: 's',
  };

  const words = text.split(' ');
  const typoPositions = [];
  const count = Math.random() > 0.6 ? 2 : 1;

  for (let i = 0; i < count; i++) {
    const wordIdx = Math.floor(
      words.length * 0.3 + Math.random() * words.length * 0.5
    );

    const word = words[wordIdx];

    if (!word || word.length < 3) continue;

    const charIdx =
      Math.floor(Math.random() * (word.length - 1)) + 1;

    const wrongChar =
      typoMap[word[charIdx].toLowerCase()] ||
      String.fromCharCode(word.charCodeAt(charIdx) + 1);

    typoPositions.push({
      wordIdx,
      charIdx,
      wrongChar,
      len: word.length - charIdx,
    });
  }

  return {
    seq: text,
    typos: typoPositions.sort((a, b) => a.wordIdx - b.wordIdx),
  };
}

function buildTypingStream(text) {
  const { typos } = injectTypos(text);
  const words = text.split(' ');
  const stream = [];

  let charPos = 0;

  const wordPositions = words.map((w, i) => {
    const start = charPos;

    charPos += w.length + (i < words.length - 1 ? 1 : 0);

    return start;
  });

  const typoEvents = typos
    .map(t => ({
      position: wordPositions[t.wordIdx] + t.charIdx,
      wrongChar: t.wrongChar,
      deleteCount: t.len,
    }))
    .sort((a, b) => a.position - b.position);

  let i = 0;
  let typoIdx = 0;

  while (i < text.length) {
    const typo = typoEvents[typoIdx];

    if (typo && i === typo.position) {
      const wrongTail =
        typo.wrongChar +
        text.slice(i + 1, i + typo.deleteCount);

      for (const ch of wrongTail) {
        stream.push({
          char: ch,
          action: 'type',
          delay: randDelay(45, 90),
        });
      }

      stream.push({
        char: '',
        action: 'pause',
        delay: 380 + Math.random() * 300,
      });

      for (let b = 0; b < wrongTail.length; b++) {
        stream.push({
          char: '',
          action: 'backspace',
          delay: randDelay(55, 110),
        });
      }

      stream.push({
        char: '',
        action: 'pause',
        delay: 160,
      });

      typoIdx++;
    }

    const ch = text[i];

    let delay = randDelay(38, 88);

    if (['.', ',', '?', '!', ':'].includes(ch)) {
      delay += randDelay(80, 200);
    }

    if (ch === ' ') {
      delay = randDelay(30, 60);
    }

    stream.push({
      char: ch,
      action: 'type',
      delay,
    });

    i++;
  }

  return stream;
}

function randDelay(min, max) {
  return min + Math.random() * (max - min);
}

function useTypingStream(stream, active) {
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [done, setDone] = useState(false);

  const idxRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active || !stream.length) return;

    idxRef.current = 0;
    setDisplayed('');
    setDone(false);

    const step = () => {
      const idx = idxRef.current;

      if (idx >= stream.length) {
        setDone(true);
        return;
      }

      const event = stream[idx];

      idxRef.current++;

      if (event.action === 'type') {
        setDisplayed(d => d + event.char);
      } else if (event.action === 'backspace') {
        setDisplayed(d => d.slice(0, -1));
      }

      timerRef.current = setTimeout(step, event.delay);
    };

    timerRef.current = setTimeout(step, 200);

    return () => clearTimeout(timerRef.current);
  }, [stream, active]);

  return {
    displayed,
    cursorVisible,
    done,
  };
}

/* ─────────────────────────────────────────────
   KAI AVATAR
   ───────────────────────────────────────────── */

function KaiAvatar({ mood = 'neutral', size = 120 }) {
  const expressions = {
    neutral: {
      eyeL: '●',
      eyeR: '●',
      mouth: '⌣',
      brow: '',
    },
    thinking: {
      eyeL: '●',
      eyeR: '◑',
      mouth: '〜',
      brow: '⌢',
    },
    typing: {
      eyeL: '●',
      eyeR: '●',
      mouth: '◡',
      brow: '',
    },
    happy: {
      eyeL: '◕',
      eyeR: '◕',
      mouth: '⌣',
      brow: '',
    },
    listening: {
      eyeL: '●',
      eyeR: '●',
      mouth: '○',
      brow: '',
    },
  };

  const expr =
    expressions[mood] || expressions.neutral;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        flexShrink: 0,
        background:
          'linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #2563eb 100%)',
        boxShadow:
          '0 8px 32px rgba(124,58,237,0.38), 0 2px 8px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '2px solid rgba(139,92,246,0.4)',
          animation:
            mood === 'typing'
              ? 'kaiPulse 1.5s ease-in-out infinite'
              : 'none',
        }}
      />

      {/* Face */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          userSelect: 'none',
        }}
      >
        {expr.brow && (
          <div
            style={{
              fontSize: size * 0.18,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1,
              marginBottom: -2,
            }}
          >
            {expr.brow}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: size * 0.13,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: size * 0.22,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {expr.eyeL}
          </span>

          <span
            style={{
              fontSize: size * 0.22,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {expr.eyeR}
          </span>
        </div>

        <div
          style={{
            fontSize: size * 0.2,
            color: '#fff',
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          {expr.mouth}
        </div>
      </div>

      {/* Headphones */}
      <div
        style={{
          position: 'absolute',
          top: -3,
          left: size * 0.08,
          right: size * 0.08,
          height: size * 0.18,
          border:
            '3px solid rgba(255,255,255,0.35)',
          borderBottom: 'none',
          borderRadius: '50px 50px 0 0',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SPEECH BUBBLE
   ───────────────────────────────────────────── */

function SpeechBubble({
  text,
  cursorVisible,
  mood,
  isEmpty,
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Upward tail toward Kai */}
      <div
        style={{
          position: 'absolute',
          top: -13,
          left: 28,
          width: 0,
          height: 0,
          borderLeft: '11px solid transparent',
          borderRight: '11px solid transparent',
          borderBottom: '13px solid #ede9fe',
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: -10,
          left: 29,
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '11px solid #fff',
          zIndex: 2,
        }}
      />

      {/* Message card */}
      <div
        style={{
          background: '#fff',
          border: '2px solid #ede9fe',
          borderRadius: 24,
          padding: '24px 32px',
          boxShadow:
            '0 4px 24px rgba(124,58,237,0.10), 0 1px 4px rgba(0,0,0,0.06)',
          minHeight: 80,
          width: '100%',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Kai label */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#7c3aed',
            textTransform: 'uppercase',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                mood === 'thinking'
                  ? '#f59e0b'
                  : mood === 'typing'
                    ? '#10b981'
                    : '#7c3aed',
              display: 'inline-block',
              flexShrink: 0,
              animation:
                mood === 'typing' ||
                mood === 'thinking'
                  ? 'dotPulse 1s ease-in-out infinite'
                  : 'none',
            }}
          />

          Kai · AI Instructor
        </div>

        {isEmpty ? (
          <ThinkingDots />
        ) : (
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: '#1e1b4b',
              margin: 0,
              fontFamily:
                "'Inter', system-ui, sans-serif",
              fontWeight: 400,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {text}

            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: '1.1em',
                background: '#7c3aed',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                borderRadius: 1,
                opacity: cursorVisible ? 1 : 0,
                transition: 'opacity 0.05s',
              }}
            />
          </p>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        padding: '4px 0',
      }}
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, #7c3aed, #4f46e5)',
            animation: `bounce 1.2s ease-in-out ${
              i * 0.18
            }s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUIZ PARSING
   ───────────────────────────────────────────── */

function parseQuiz(content) {
  const match = content.match(
    /\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/
  );

  if (!match) {
    return {
      text: content,
      quiz: null,
    };
  }

  try {
    const quiz = JSON.parse(match[1]);

    const text = content
      .replace(
        /\[QUIZ\][\s\S]*?\[\/QUIZ\]/,
        ''
      )
      .trim();

    return {
      text,
      quiz,
    };
  } catch {
    return {
      text: content,
      quiz: null,
    };
  }
}

/* ─────────────────────────────────────────────
   MARKDOWN RENDERER
   ───────────────────────────────────────────── */

function renderMarkdown(text) {
  const escaped = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const protectedParts = [];

  const protect = value => {
    const token = `@@KAI_PART_${protectedParts.length}@@`;

    protectedParts.push(value);

    return token;
  };

  let html = escaped
    .replace(
      /```(\w*)\n?([\s\S]*?)```/g,
      (_, language, code) =>
        protect(
          `<pre><code>${code.trimEnd()}</code></pre>`
        )
    )
    .replace(
      /`([^`\n]+)`/g,
      (_, code) =>
        protect(`<code>${code}</code>`)
    )
    .replace(
      /(\*\*|__)(.+?)\1/g,
      '<strong>$2</strong>'
    )
    .replace(
      /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
      '<em>$1</em>'
    )
    .replace(
      /(?<!\w)_([^_\n]+)_(?!\w)/g,
      '<em>$1</em>'
    )
    .replace(
      /^### (.+)$/gm,
      '<h3>$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2>$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1>$1</h1>'
    )
    .replace(
      /^\s*[-•]\s+(.+)$/gm,
      '<li>$1</li>'
    )
    .replace(
      /(<li>.*<\/li>)/gs,
      '<ul>$1</ul>'
    )
    .replace(
      /^\d+\.\s+(.+)$/gm,
      '<li>$1</li>'
    )
    .replace(
      /^&gt;\s+(.+)$/gm,
      '<blockquote>$1</blockquote>'
    )
    .replace(
      /\n\n/g,
      '</p><p>'
    )
    .replace(
      /\n/g,
      '<br />'
    );

  protectedParts.forEach((part, index) => {
    html = html.replace(
      `@@KAI_PART_${index}@@`,
      part
    );
  });

  return `<p>${html}</p>`;
}

/* ─────────────────────────────────────────────
   INLINE QUIZ CARD
   ───────────────────────────────────────────── */
function KaiQuizCard({ quiz, lessonId }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === quiz.correct;

  const handleAnswer = async (index) => {
    if (submitted) return;

    setSelected(index);
    setSubmitted(true);

    try {
      await fetch('/api/progress/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          lessonId,
          question: quiz.question,
          correct: index === quiz.correct,
        }),
      });
    } catch {
      // Non-fatal
    }
  };

  return (
    <div
      style={{
        marginTop: 16,
        padding: '20px',
        background: '#faf9ff',
        border: '1.5px solid #ede9fe',
        borderRadius: 18,
      }}
    >
      {/* Quiz header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background:
              'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 19,
          }}
        >
          🎯
        </div>

        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: '#1e1b4b',
            }}
          >
            Quick Quiz
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#8b7cf6',
            }}
          >
            Kai will review your answer
          </div>
        </div>
      </div>

      {/* Question */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: '#1e1b4b',
          lineHeight: 1.6,
          marginBottom: 14,
        }}
      >
        {quiz.question}
      </div>

      {/* Answers */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
        }}
      >
        {quiz.options.map((opt, i) => {
          let background = '#fff';
          let border = '#ede9fe';
          let color = '#1e1b4b';

          if (submitted) {
            if (i === quiz.correct) {
              background = '#f0fdf4';
              border = '#86efac';
              color = '#166534';
            } else if (i === selected) {
              background = '#fef2f2';
              border = '#fca5a5';
              color = '#991b1b';
            }
          } else if (i === selected) {
            background = '#f5f3ff';
            border = '#7c3aed';
            color = '#4c1d95';
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={submitted}
              style={{
                width: '100%',
                background,
                border: `2px solid ${border}`,
                borderRadius: 13,
                padding: '11px 14px',
                textAlign: 'left',
                cursor: submitted
                  ? 'default'
                  : 'pointer',
                color,
                fontFamily: 'inherit',
                fontSize: 14,
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 11,
              }}
            >
              <span
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: '50%',
                  flexShrink: 0,
                  border: `2px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {submitted && i === quiz.correct
                  ? '✓'
                  : submitted && i === selected
                    ? '✗'
                    : 'ABCD'[i]}
              </span>

              {opt}
            </button>
          );
        })}
      </div>

      {/* Kai review */}
      {submitted && (
        <div
          style={{
            marginTop: 14,
            padding: '14px 16px',
            borderRadius: 14,
            background: isCorrect
              ? '#f0fdf4'
              : '#fef2f2',
            border: `1.5px solid ${
              isCorrect
                ? '#86efac'
                : '#fca5a5'
            }`,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: isCorrect
                ? '#166534'
                : '#991b1b',
              marginBottom: 5,
            }}
          >
            {isCorrect
              ? '🎉 Kai: Correct!'
              : '🤔 Kai: Not quite'}
          </div>

          <div
            style={{
              fontSize: 14,
              color: '#374151',
              lineHeight: 1.6,
            }}
          >
            {isCorrect
              ? 'Excellent! You understood this concept.'
              : 'Good attempt. Let me explain why the correct answer is different.'}
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              color: '#374151',
              lineHeight: 1.6,
            }}
          >
            {quiz.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MESSAGE HISTORY ITEM
   ───────────────────────────────────────────── */

function HistoryItem({
  role,
  content,
  lessonId,
}) {
  const [showQuiz, setShowQuiz] =
    useState(false);

  if (role === 'user') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '75%',
            background:
              'linear-gradient(135deg, #7c3aed, #4f46e5)',
            borderRadius:
              '20px 20px 4px 20px',
            padding: '12px 18px',
            color: '#fff',
            fontSize: 15,
            lineHeight: 1.65,
            fontWeight: 400,
            boxShadow:
              '0 2px 12px rgba(124,58,237,0.25)',
          }}
        >
          {content}
        </div>

        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: '#e0e7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            marginLeft: 10,
            flexShrink: 0,
            alignSelf: 'flex-end',
          }}
        >
          🧑‍💻
        </div>
      </div>
    );
  }

  const { text, quiz } =
    parseQuiz(content);

  return (
    <>
      <div
        style={{
          width: '100%',
          marginBottom: 24,
        }}
      >
        {/* Kai icon above historical message */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow:
                '0 4px 14px rgba(124,58,237,0.22)',
            }}
          >
            ✨
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#312e81',
              }}
            >
              Kai
            </div>

            <div
              style={{
                fontSize: 11,
                color: '#8b7cf6',
                fontWeight: 500,
              }}
            >
              AI Cybersecurity Instructor
            </div>
          </div>
        </div>

        {/* Full-width historical card */}
        <div
          style={{
            width: '100%',
            background: '#fff',
            border:
              '1.5px solid #ede9fe',
            borderRadius: 20,
            padding: '18px 24px',
            fontSize: 15,
            lineHeight: 1.7,
            color: '#1e1b4b',
            boxShadow:
              '0 2px 8px rgba(124,58,237,0.07)',
          }}
        >
          <div
            className="kai-prose"
            dangerouslySetInnerHTML={{
              __html:
                renderMarkdown(text),
            }}
          />

          {quiz && (
            <button
              onClick={() => setShowQuiz(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
                padding: '9px 16px',
                borderRadius: 10,
                border: 'none',
                background:
                  'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow:
                  '0 2px 10px rgba(124,58,237,0.3)',
              }}
            >
              {showQuiz ? '▲ Hide Quiz' : '🎯 Take Quiz'}
            </button>
          )}
        </div>

        {/* Quiz is rendered INLINE directly below Kai's message — never as a modal. */}
        {showQuiz && quiz && (
          <KaiQuizCard
            quiz={quiz}
            lessonId={lessonId}
          />
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   QUICK REPLY CHIPS
   ───────────────────────────────────────────── */

function QuickChips({
  onSend,
  disabled,
}) {
  const chips = [
    'Tell me more 📖',
    'Give me an example 💡',
    'Quiz me! 🎯',
    "What's next? ➡️",
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 12,
      }}
    >
      {chips.map(c => (
        <button
          key={c}
          onClick={() => onSend(c)}
          disabled={disabled}
          style={{
            padding: '6px 14px',
            borderRadius: 20,
            border:
              '1.5px solid #ede9fe',
            background: '#fff',
            color: '#7c3aed',
            fontSize: 13,
            fontWeight: 500,
            cursor: disabled
              ? 'not-allowed'
              : 'pointer',
            opacity: disabled
              ? 0.5
              : 1,
            transition: 'all 0.15s',
            fontFamily: 'inherit',
            boxShadow:
              '0 1px 4px rgba(124,58,237,0.08)',
          }}
          onMouseEnter={e => {
            if (!disabled) {
              e.currentTarget.style.background =
                '#f5f3ff';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background =
              '#fff';
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */

export default function KaiTeacher({
  lesson,
  module,
  onBack,
  onBackToModule,
}) {
  const { user, logout } = useAuth();

  const [history, setHistory] =
    useState([]);

  const [streaming, setStreaming] =
    useState('');

  const [stream, setStream] =
    useState([]);

  const [phase, setPhase] =
    useState('idle');

  const [startError, setStartError] =
    useState(null);

  const [sendError, setSendError] =
    useState(null);

  const [input, setInput] =
    useState('');

  const [mood, setMood] =
    useState('happy');

  const [started, setStarted] =
    useState(false);

   const [completed, setCompleted] = useState(false);
const [completing, setCompleting] = useState(false);

  const bottomRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const {
    displayed,
    cursorVisible,
    done: typingDone,
  } = useTypingStream(
    stream,
    phase === 'typing'
  );

  /* Settle typed message */
  useEffect(() => {
    if (
      typingDone &&
      phase === 'typing' &&
      streaming
    ) {
      setHistory(h => [
        ...h,
        {
          role: 'assistant',
          content: streaming,
        },
      ]);

      setStreaming('');
      setStream([]);
      setPhase('done');
      setMood('listening');
    }
  }, [
    typingDone,
    phase,
    streaming,
  ]);

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [
    history,
    displayed,
    phase,
  ]);

  /* Start lesson */
  useEffect(() => {
    if (lesson && !started) {
      setStarted(true);
      startLesson();
    }
  }, [lesson]);

  const startLesson =
    useCallback(async () => {
      setPhase('loading');
      setMood('thinking');
      setStartError(null);

      try {
        const res =
          await fetch('/api/chat/start', {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              lessonId: lesson?.id,
            }),
          });

        if (!res.ok) {
          const errData =
            await res
              .json()
              .catch(() => ({}));

          throw new Error(
            errData.error ||
              `Server error ${res.status}`
          );
        }

        const data =
          await res.json();

        if (data.alreadyStarted) {
          const histRes =
            await fetch(
              `/api/chat/history/${lesson?.id}`,
              {
                credentials:
                  'include',
              }
            );

          if (!histRes.ok) {
            const errData =
              await histRes
                .json()
                .catch(() => ({}));

            throw new Error(
              errData.error ||
                `Could not load history (${histRes.status})`
            );
          }

          const histData =
            await histRes.json();

          const msgs =
            (
              histData.messages ||
              []
            ).map(m => ({
              role: m.role,
              content: m.content,
            }));

          const lastAiIdx =
            [...msgs]
              .map((m, i) =>
                m.role ===
                'assistant'
                  ? i
                  : -1
              )
              .filter(
                i => i >= 0
              )
              .pop();

          if (
            lastAiIdx != null
          ) {
            setHistory(
              msgs.slice(
                0,
                lastAiIdx
              )
            );

            beginTyping(
              msgs[lastAiIdx]
                .content
            );
          } else {
            setHistory(msgs);
            setPhase('done');
            setMood('listening');
          }
        } else {
          if (!data.reply) {
            throw new Error(
              'Server returned an empty reply'
            );
          }

          beginTyping(data.reply);
        }
      } catch (err) {
        console.error(
          'startLesson error:',
          err
        );

        setStartError(
          err.message
        );

        setPhase('error');
        setMood('neutral');
      }
    }, [lesson]);

  const beginTyping = text => {
    const s =
      buildTypingStream(text);

    setStreaming(text);
    setStream(s);
    setPhase('typing');
    setMood('typing');
  };

   const markComplete = async () => {
  if (!lesson?.id || completing || completed) return;

  setCompleting(true);

  try {
    const res = await fetch('/api/progress/lesson', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        lessonId: lesson.id,
        status: 'completed',
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to mark lesson complete');
    }

    setCompleted(true);
  } catch (err) {
    console.error('markComplete error:', err);
  } finally {
    setCompleting(false);
  }
};

  const sendMessage =
    async text => {
      const msg = (
        text || input
      ).trim();

      if (
        !msg ||
        phase === 'loading' ||
        phase === 'typing'
      ) {
        return;
      }

      setInput('');

      setHistory(h => [
        ...h,
        {
          role: 'user',
          content: msg,
        },
      ]);

      setPhase('loading');
      setMood('thinking');
      setSendError(null);

      try {
        const res =
          await fetch(
            '/api/chat/message',
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              credentials:
                'include',
              body: JSON.stringify({
                lessonId:
                  lesson?.id,
                content: msg,
              }),
            }
          );

        if (!res.ok) {
          const errData =
            await res
              .json()
              .catch(() => ({}));

          throw new Error(
            errData.error ||
              `Server error ${res.status}`
          );
        }

        const data =
          await res.json();

        if (!data.reply) {
          throw new Error(
            'Server returned an empty reply'
          );
        }

        beginTyping(
          data.reply
        );
      } catch (err) {
        console.error(
          'sendMessage error:',
          err
        );

        setHistory(h =>
          h.slice(0, -1)
        );

        setInput(msg);
        setSendError(
          err.message
        );

        setPhase('done');
        setMood('neutral');
      }
    };

  const handleKey = e => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  const busy =
    phase === 'loading' ||
    phase === 'typing' ||
    phase === 'error';

  const showBubble =
    phase === 'loading' ||
    phase === 'typing';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background:
          'linear-gradient(160deg, #f8f7ff 0%, #eff6ff 50%, #fdf4ff 100%)',
        fontFamily:
          "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      <KaiStyles />

      {/* ─────────────────────────────────────
          HEADER
      ───────────────────────────────────── */}

      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          padding:
            '14px 24px',
          background:
            'rgba(255,255,255,0.88)',
          backdropFilter:
            'blur(12px)',
          borderBottom:
            '1px solid #ede9fe',
          boxShadow:
            '0 1px 12px rgba(124,58,237,0.07)',
          flexShrink: 0,
          zIndex: 10,
          gap: 16,
        }}
      >
        {/* Left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 0,
          }}
        >
          <button
            onClick={
              onBack ||
              onBackToModule
            }
            style={{
              background: 'none',
              border:
                '1.5px solid #ede9fe',
              color: '#7c3aed',
              borderRadius: 10,
              padding:
                '6px 14px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems:
                'center',
              gap: 6,
              transition:
                'all 0.15s',
              fontFamily:
                'inherit',
              flexShrink: 0,
            }}
            onMouseEnter={e =>
              (e.currentTarget.style.background =
                '#f5f3ff')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.background =
                'none')
            }
          >
            ← Back
          </button>

          <div
            style={{
              width: 1,
              height: 24,
              background:
                '#ede9fe',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 8,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background:
                  'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🔐
            </div>

            <span
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: '#1e1b4b',
                letterSpacing:
                  '-0.02em',
                whiteSpace:
                  'nowrap',
              }}
            >
              Cyber Academy
            </span>
          </div>
        </div>

        {/* Center */}
        <div
          style={{
            textAlign: 'center',
            flex: 1,
            padding:
              '0 16px',
            minWidth: 0,
          }}
        >
          {module && (
            <div
              style={{
                fontSize: 11,
                color: '#8b7cf6',
                fontWeight: 600,
                letterSpacing:
                  '0.06em',
                textTransform:
                  'uppercase',
                whiteSpace:
                  'nowrap',
                overflow: 'hidden',
                textOverflow:
                  'ellipsis',
              }}
            >
              {module.title}
            </div>
          )}

          {lesson && (
            <div
              style={{
                fontSize: 14,
                color: '#1e1b4b',
                fontWeight: 600,
                marginTop: 1,
                whiteSpace:
                  'nowrap',
                overflow: 'hidden',
                textOverflow:
                  'ellipsis',
              }}
            >
              {lesson.title}
            </div>
          )}
        </div>

        {/* Right */}
        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            className="kai-user-pill"
            style={{
              padding:
                '6px 14px',
              borderRadius: 20,
              background:
                '#f5f3ff',
              border:
                '1.5px solid #ede9fe',
              fontSize: 13,
              color: '#7c3aed',
              fontWeight: 500,
            }}
          >
            👤{' '}
            {user?.username ||
              'Student'}
          </div>

          <button
            onClick={logout}
            style={{
              background: 'none',
              border:
                '1.5px solid #fce7f3',
              color: '#ec4899',
              borderRadius: 10,
              padding:
                '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily:
                'inherit',
              transition:
                'all 0.15s',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────
          FULL-WIDTH MAIN AREA
      ───────────────────────────────────── */}

      <div
        className="kai-main-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding:
            '32px 0 20px',
          width: '100%',
        }}
      >
        {/* NO maxWidth — full screen */}
        <div
          style={{
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* Startup error */}
          {phase === 'error' &&
            startError && (
              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  alignItems:
                    'center',
                  gap: 16,
                  padding:
                    '48px 24px',
                  textAlign:
                    'center',
                  animation:
                    'fadeSlideIn 0.3s ease',
                }}
              >
                <KaiAvatar
                  mood="neutral"
                  size={72}
                />

                <div
                  style={{
                    background: '#fff',
                    border:
                      '2px solid #fecaca',
                    borderRadius: 20,
                    padding:
                      '20px 28px',
                    maxWidth: 480,
                    boxShadow:
                      '0 4px 20px rgba(239,68,68,0.10)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#dc2626',
                      marginBottom: 6,
                      textTransform:
                        'uppercase',
                      letterSpacing:
                        '0.06em',
                    }}
                  >
                    ⚠️ Couldn't start
                    lesson
                  </div>

                  <div
                    style={{
                      fontSize: 15,
                      color: '#1e1b4b',
                      lineHeight: 1.65,
                      marginBottom: 16,
                    }}
                  >
                    {startError}
                  </div>

                  <button
                    onClick={() => {
                      setStarted(false);
                      setPhase(
                        'idle'
                      );

                      setTimeout(
                        startLesson,
                        100
                      );
                    }}
                    style={{
                      padding:
                        '9px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background:
                        'linear-gradient(135deg, #7c3aed, #4f46e5)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      fontFamily:
                        'inherit',
                      boxShadow:
                        '0 4px 14px rgba(124,58,237,0.3)',
                    }}
                  >
                    ↺ Retry
                  </button>
                </div>
              </div>
            )}

          {/* History */}
          {history.map(
            (msg, i) => (
              <HistoryItem
                key={i}
                role={msg.role}
                content={
                  msg.content
                }
                lessonId={
                  lesson?.id
                }
              />
            )
          )}

          {/* Send error */}
          {sendError && (
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: 12,
                marginBottom: 16,
                background: '#fff',
                border:
                  '1.5px solid #fecaca',
                borderRadius: 14,
                padding:
                  '12px 18px',
                animation:
                  'fadeSlideIn 0.25s ease',
                boxShadow:
                  '0 2px 10px rgba(239,68,68,0.08)',
              }}
            >
              <span
                style={{
                  fontSize: 18,
                }}
              >
                ⚠️
              </span>

              <div
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: '#7f1d1d',
                  lineHeight: 1.5,
                }}
              >
                <strong
                  style={{
                    color: '#dc2626',
                  }}
                >
                  Message failed:
                </strong>{' '}
                {sendError}
              </div>

              <button
                onClick={() =>
                  setSendError(null)
                }
                style={{
                  background:
                    'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: 18,
                  cursor:
                    'pointer',
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* ─────────────────────────────────
              KAI CURRENT TEACHING MESSAGE
              AVATAR ABOVE CARD
          ───────────────────────────────── */}

          {showBubble && (
            <div
              style={{
                width: '100%',
                marginBottom: 28,
                animation:
                  'fadeSlideIn 0.3s ease',
              }}
            >
              {/* Kai identity */}
              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 12,
                  marginBottom: 12,
                  paddingLeft: 4,
                }}
              >
                <KaiAvatar
                  mood={mood}
                  size={62}
                />

                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#312e81',
                    }}
                  >
                    Kai
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: '#8b7cf6',
                      fontWeight: 600,
                      marginTop: 1,
                    }}
                  >
                    AI Cybersecurity
                    Instructor
                  </div>
                </div>

                {phase ===
                  'typing' && (
                  <span
                    style={{
                      fontSize: 20,
                      animation:
                        'handWave 1.5s ease-in-out infinite',
                    }}
                  >
                    ✍️
                  </span>
                )}

                {phase ===
                  'loading' && (
                  <span
                    style={{
                      fontSize: 20,
                      animation:
                        'thinking 2s ease-in-out infinite',
                    }}
                  >
                    💭
                  </span>
                )}
              </div>

              {/* Full-width message */}
              <SpeechBubble
                text={displayed}
                cursorVisible={
                  cursorVisible
                }
                mood={mood}
                isEmpty={
                  phase ===
                  'loading'
                }
              />
            </div>
          )}

          <div
            ref={bottomRef}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────
          BOTTOM INPUT
      ───────────────────────────────────── */}

      <div
        style={{
          background:
            'rgba(255,255,255,0.94)',
          backdropFilter:
            'blur(12px)',
          borderTop:
            '1px solid #ede9fe',
          padding:
            '16px 0 20px',
          flexShrink: 0,
          width: '100%',
        }}
      >
        <div
          style={{
            width: '100%',
            margin: '0 auto',
          }}
        >
            <button
  onClick={markComplete}
  disabled={completing || completed}
  style={{
    width: '100%',
    padding: '12px 18px',
    marginBottom: 12,
    borderRadius: 14,
    border: 'none',
    background: completed
      ? '#dcfce7'
      : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: completed ? '#166534' : '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: completed || completing
      ? 'default'
      : 'pointer',
    fontFamily: 'inherit',
    boxShadow: completed
      ? 'none'
      : '0 4px 14px rgba(124,58,237,0.25)',
  }}
>
  {completing
    ? '⏳ Marking complete...'
    : completed
      ? '✓ Lesson Completed'
      : '✓ Mark as Complete'}
</button>
           
          <QuickChips
            onSend={sendMessage}
            disabled={busy}
          />

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems:
                'flex-end',
              width: '100%',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={
                handleKey
              }
              disabled={busy}
              placeholder={
                busy
                  ? 'Kai is typing…'
                  : 'Ask Kai anything about this lesson…'
              }
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                borderRadius: 16,
                border:
                  '2px solid ' +
                  (busy
                    ? '#ede9fe'
                    : '#c4b5fd'),
                padding:
                  '12px 18px',
                fontSize: 15,
                lineHeight: 1.5,
                fontFamily:
                  "'Inter', system-ui, sans-serif",
                background: busy
                  ? '#f9f9ff'
                  : '#fff',
                color: '#1e1b4b',
                outline: 'none',
                transition:
                  'border-color 0.2s, box-shadow 0.2s',
                boxShadow: busy
                  ? 'none'
                  : '0 0 0 3px rgba(124,58,237,0.08)',
                maxHeight: 120,
                overflowY: 'auto',
              }}
              onFocus={e => {
                if (!busy) {
                  e.target.style.borderColor =
                    '#7c3aed';
                }
              }}
              onBlur={e => {
                e.target.style.borderColor =
                  busy
                    ? '#ede9fe'
                    : '#c4b5fd';
              }}
            />

            <button
              onClick={() =>
                sendMessage()
              }
              disabled={
                busy ||
                !input.trim()
              }
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                flexShrink: 0,
                background:
                  busy ||
                  !input.trim()
                    ? '#e0d9f9'
                    : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none',
                cursor:
                  busy ||
                  !input.trim()
                    ? 'not-allowed'
                    : 'pointer',
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center',
                fontSize: 20,
                transition:
                  'all 0.2s',
                boxShadow:
                  busy ||
                  !input.trim()
                    ? 'none'
                    : '0 4px 16px rgba(124,58,237,0.35)',
              }}
            >
              {busy
                ? '⏳'
                : '↑'}
            </button>
          </div>

          {/* Status */}
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems:
                'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius:
                  '50%',
                background:
                  phase ===
                  'typing'
                    ? '#10b981'
                    : phase ===
                        'loading'
                      ? '#f59e0b'
                      : '#8b7cf6',
                animation: busy
                  ? 'dotPulse 1s ease-in-out infinite'
                  : 'none',
              }}
            />

            <span
              style={{
                fontSize: 12,
                color: '#a78bfa',
                fontWeight: 500,
              }}
            >
              {phase ===
              'loading'
                ? 'Kai is thinking…'
                : phase ===
                    'typing'
                  ? 'Kai is typing…'
                  : 'Kai is ready · Enter to send'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   KAI STYLES
   ───────────────────────────────────────────── */

function KaiStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      * {
        box-sizing: border-box;
      }

      html, body, #root {
        width: 100%;
        min-width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }

      @keyframes kaiPulse {
        0%, 100% {
          opacity: 0.4;
          transform: scale(1);
        }

        50% {
          opacity: 1;
          transform: scale(1.04);
        }
      }

      @keyframes dotPulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }

        50% {
          opacity: 0.45;
          transform: scale(0.8);
        }
      }

      @keyframes bounce {
        0%, 80%, 100% {
          transform: translateY(0);
          opacity: 0.7;
        }

        40% {
          transform: translateY(-7px);
          opacity: 1;
        }
      }

      @keyframes fadeSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes handWave {
        0%, 100% {
          transform: rotate(0deg) translateY(0);
        }

        25% {
          transform: rotate(-12deg) translateY(-2px);
        }

        75% {
          transform: rotate(8deg) translateY(-1px);
        }
      }

      @keyframes thinking {
        0%, 100% {
          opacity: 0.6;
          transform: scale(1) translateY(0);
        }

        50% {
          opacity: 1;
          transform: scale(1.1) translateY(-3px);
        }
      }

      .kai-main-scroll::-webkit-scrollbar {
        width: 6px;
      }

      .kai-main-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .kai-main-scroll::-webkit-scrollbar-thumb {
        background: #ddd6fe;
        border-radius: 4px;
      }

      .kai-main-scroll::-webkit-scrollbar-thumb:hover {
        background: #c4b5fd;
      }

      @media (max-width: 700px) {
        .kai-user-pill {
          display: none !important;
        }
      }

      @media (max-width: 600px) {
        .kai-main-scroll {
          padding: 20px 0 16px !important;
        }

        .kai-user-pill {
          display: none !important;
        }

        .kai-main-scroll + div {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      }

      @media (max-width: 480px) {
        header {
          padding-left: 12px !important;
          padding-right: 12px !important;
        }

        .kai-main-scroll {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .kai-main-scroll + div {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }      }

    `}</style>
  );
}
       
