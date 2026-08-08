import React, { useState } from 'react';

function CommandLesson({
  command,
  learnedSet,
  onToggleLearned,
  onAskKai,
  onNext,
  onBack,
  lessonNumber,
  totalLessons,
}) {
  const [terminalCommand, setTerminalCommand] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const isLearned = learnedSet.has(command.id);

  const diff =
    DIFFICULTY_COLOR[command.difficulty] ||
    DIFFICULTY_COLOR.Beginner;

  /*
    Build a simple quiz from the command data.
    If your command later has a `quiz` property, it will use that instead.
  */
  const quiz = command.quiz || {
    question: `What is the main purpose of the ${command.name} command?`,
    options: [
      command.purpose,
      `Delete all files from the system using ${command.name}.`,
      `Create a new user account using ${command.name}.`,
      `Shut down the computer using ${command.name}.`,
    ],
    correctAnswer: 0,
  };

  const submitQuiz = () => {
    if (selectedAnswer === null) return;
    setQuizSubmitted(true);

    if (
      selectedAnswer === quiz.correctAnswer &&
      !isLearned
    ) {
      onToggleLearned(command.id);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 'none',
        margin: 0,
        padding: '24px 24px 50px',
        boxSizing: 'border-box',
      }}
    >
      {/* Progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 26,
          width: '100%',
        }}
      >
        <div
          style={{
            flex: 1,
            height: 5,
            background: 'rgba(255,255,255,.07)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${
                totalLessons
                  ? (lessonNumber / totalLessons) * 100
                  : 0
              }%`,
              height: '100%',
              background:
                'linear-gradient(90deg,#00ff88,#00c853)',
              boxShadow:
                '0 0 12px rgba(0,255,136,.5)',
            }}
          />
        </div>

        <span
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          {lessonNumber}/{totalLessons}
        </span>
      </div>

      {/* =====================================================
          KAI TEACHING MESSAGE
      ===================================================== */}

      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          background:
            'linear-gradient(145deg,var(--surface),rgba(0,255,136,.025))',
          border:
            '1px solid rgba(0,255,136,.16)',
          borderRadius: 20,
          padding: 'clamp(20px,4vw,36px)',
          marginBottom: 22,
          boxShadow:
            '0 20px 70px rgba(0,0,0,.18)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <KaiAvatar size={52} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: GREEN,
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 5,
              }}
            >
              KAI • NETWORKING
            </div>

            <h1
              style={{
                margin: '0 0 12px',
                fontSize:
                  'clamp(1.5rem,4vw,2.2rem)',
                lineHeight: 1.15,
                letterSpacing: '-.03em',
              }}
            >
              Let's learn {' '}
              <code
                style={{
                  color: GREEN,
                  fontFamily:
                    '"JetBrains Mono",monospace',
                }}
              >
                {command.name}
              </code>
            </h1>

            <p
              style={{
                margin: 0,
                color: 'var(--text-muted)',
                lineHeight: 1.75,
                fontSize: 14,
              }}
            >
              {command.description}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div
          style={{
            marginTop: 28,
            background:
              'rgba(0,255,136,.035)',
            border:
              '1px solid rgba(0,255,136,.10)',
            borderRadius: 14,
            padding: '16px 18px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: GREEN,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              marginBottom: 8,
            }}
          >
            What it does
          </div>

          <p
            style={{
              margin: 0,
              color: 'var(--text)',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {command.purpose}
          </p>
        </div>

        {/* Syntax */}
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontWeight: 700,
              marginBottom: 7,
              textTransform: 'uppercase',
            }}
          >
            Syntax
          </div>

          <div
            style={{
              background: '#070b12',
              border:
                '1px solid rgba(0,255,136,.16)',
              borderRadius: 10,
              padding: '12px 14px',
              color: GREEN,
              fontFamily:
                '"JetBrains Mono",monospace',
              fontSize: 13,
              overflowX: 'auto',
            }}
          >
            $ {command.syntax}
          </div>
        </div>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 18,
          }}
        >
          <span
            style={{
              color: diff.color,
              background: diff.bg,
              borderRadius: 999,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {command.difficulty}
          </span>

          <span
            style={{
              color: 'var(--text-muted)',
              background: 'var(--card)',
              borderRadius: 999,
              padding: '5px 10px',
              fontSize: 11,
            }}
          >
            ⏱ {command.estimatedTime}
          </span>

          <span
            style={{
              color: GREEN,
              background:
                'rgba(0,255,136,.06)',
              borderRadius: 999,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            ⚡ {command.xp} XP
          </span>
        </div>
      </div>

      {/* =====================================================
          INLINE QUIZ
          Appears DIRECTLY below Kai message
      ===================================================== */}

      {showQuiz && (
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--surface)',
            border:
              '1px solid rgba(0,255,136,.18)',
            borderRadius: 18,
            padding: 'clamp(20px,4vw,30px)',
            marginBottom: 22,
            boxShadow:
              '0 15px 50px rgba(0,0,0,.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background:
                  'rgba(0,255,136,.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 21,
              }}
            >
              🎯
            </div>

            <div>
              <div
                style={{
                  color: GREEN,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '.08em',
                }}
              >
                KAI • QUICK QUIZ
              </div>

              <strong
                style={{
                  fontSize: 18,
                }}
              >
                Let's test what you learned
              </strong>
            </div>
          </div>

          {/* Question */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1.5,
              marginBottom: 18,
            }}
          >
            {quiz.question}
          </div>

          {/* Answers */}
          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            {quiz.options.map((option, index) => {
              const selected =
                selectedAnswer === index;

              const correct =
                quizSubmitted &&
                index === quiz.correctAnswer;

              const wrong =
                quizSubmitted &&
                selected &&
                index !== quiz.correctAnswer;

              return (
                <button
                  key={index}
                  disabled={quizSubmitted}
                  onClick={() =>
                    setSelectedAnswer(index)
                  }
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: correct
                      ? '1px solid rgba(34,197,94,.5)'
                      : wrong
                      ? '1px solid rgba(255,34,68,.5)'
                      : selected
                      ? '1px solid rgba(0,255,136,.5)'
                      : '1px solid var(--border)',
                    background: correct
                      ? 'rgba(34,197,94,.10)'
                      : wrong
                      ? 'rgba(255,34,68,.08)'
                      : selected
                      ? 'rgba(0,255,136,.08)'
                      : 'var(--card)',
                    color: 'var(--text)',
                    cursor: quizSubmitted
                      ? 'default'
                      : 'pointer',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      width: 25,
                      height: 25,
                      borderRadius: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                      background:
                        'rgba(0,255,136,.08)',
                      color: GREEN,
                      fontWeight: 900,
                    }}
                  >
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  {option}

                  {correct && (
                    <span
                      style={{
                        float: 'right',
                      }}
                    >
                      ✅
                    </span>
                  )}

                  {wrong && (
                    <span
                      style={{
                        float: 'right',
                      }}
                    >
                      ❌
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quiz buttons */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 18,
              flexWrap: 'wrap',
            }}
          >
            {!quizSubmitted ? (
              <button
                onClick={submitQuiz}
                disabled={selectedAnswer === null}
                style={{
                  padding: '11px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background:
                    selectedAnswer === null
                      ? 'rgba(0,255,136,.15)'
                      : 'linear-gradient(135deg,#00ff88,#00c853)',
                  color: '#03150a',
                  cursor:
                    selectedAnswer === null
                      ? 'not-allowed'
                      : 'pointer',
                  fontWeight: 900,
                }}
              >
                Check Answer →
              </button>
            ) : (
              <button
                onClick={resetQuiz}
                style={{
                  padding: '11px 18px',
                  borderRadius: 10,
                  border:
                    '1px solid rgba(0,255,136,.2)',
                  background:
                    'rgba(0,255,136,.06)',
                  color: GREEN,
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                Try Again
              </button>
            )}

            {quizSubmitted && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color:
                    selectedAnswer ===
                    quiz.correctAnswer
                      ? '#22c55e'
                      : '#ff647c',
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {selectedAnswer ===
                quiz.correctAnswer
                  ? '🎉 Correct! Lesson understood.'
                  : 'Not quite. Try again!'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Example */}
      {command.examples?.length > 0 && (
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding:
              'clamp(18px,4vw,26px)',
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background:
                  'rgba(0,255,136,.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              💡
            </span>

            <div>
              <strong>See it in action</strong>

              <div
                style={{
                  fontSize: 11,
                  color:
                    'var(--text-muted)',
                }}
              >
                Here's how Kai would use it
              </div>
            </div>
          </div>

          {command.examples
            .slice(0, 1)
            .map((ex, i) => (
              <div key={i}>
                <div
                  style={{
                    color:
                      'var(--text-muted)',
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  {ex.description}
                </div>

                <div
                  style={{
                    background: '#070b12',
                    borderRadius: 10,
                    padding: 15,
                    border:
                      '1px solid rgba(0,255,136,.13)',
                  }}
                >
                  <div
                    style={{
                      color: GREEN,
                      fontFamily:
                        '"JetBrains Mono",monospace',
                      fontSize: 13,
                      marginBottom: 10,
                    }}
                  >
                    $ {ex.command}
                  </div>

                  <pre
                    style={{
                      margin: 0,
                      color: '#94a3b8',
                      fontFamily:
                        '"JetBrains Mono",monospace',
                      fontSize: 12,
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {ex.output}
                  </pre>
                </div>

                <button
                  onClick={() =>
                    setTerminalCommand(
                      ex.command
                    )
                  }
                  style={{
                    marginTop: 12,
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border:
                      '1px solid rgba(0,255,136,.2)',
                    background:
                      'rgba(0,255,136,.06)',
                    color: GREEN,
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  ▶ Try it yourself
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Terminal */}
      {terminalCommand && (
        <div
          style={{
            width: '100%',
            marginBottom: 22,
          }}
        >
          <Terminal
            preloadCommand={terminalCommand}
          />
        </div>
      )}

      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 14,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: '11px 15px',
            borderRadius: 10,
            background: 'var(--card)',
            border:
              '1px solid var(--border)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          ← Back
        </button>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {/* QUIZ BUTTON */}
          <button
            onClick={() => {
              setShowQuiz((v) => !v);

              if (showQuiz) {
                resetQuiz();
              }
            }}
            style={{
              padding: '11px 15px',
              borderRadius: 10,
              background:
                showQuiz
                  ? 'rgba(0,255,136,.15)'
                  : 'rgba(0,255,136,.07)',
              border:
                '1px solid rgba(0,255,136,.25)',
              color: GREEN,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            🎯 {showQuiz ? 'Hide Quiz' : 'Quiz me'}
          </button>

          {/* ASK KAI */}
          <button
            onClick={() =>
              onAskKai(command)
            }
            style={{
              padding: '11px 15px',
              borderRadius: 10,
              background:
                'rgba(0,255,136,.07)',
              border:
                '1px solid rgba(0,255,136,.2)',
              color: GREEN,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            🤖 Ask Kai
          </button>

          {/* MARK LEARNED */}
          <button
            onClick={() =>
              onToggleLearned(command.id)
            }
            style={{
              padding: '11px 15px',
              borderRadius: 10,
              background: isLearned
                ? 'rgba(34,197,94,.10)'
                : 'var(--card)',
              border:
                '1px solid ' +
                (isLearned
                  ? 'rgba(34,197,94,.35)'
                  : 'var(--border)'),
              color: isLearned
                ? '#22c55e'
                : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            {isLearned
              ? '✓ Learned'
              : 'Mark as learned'}
          </button>

          {/* NEXT */}
          <button
            onClick={onNext}
            style={{
              padding: '11px 20px',
              borderRadius: 10,
              background:
                'linear-gradient(135deg,#00ff88,#00c853)',
              border: 'none',
              color: '#03150a',
              cursor: 'pointer',
              fontWeight: 900,
              boxShadow:
                '0 0 20px rgba(0,255,136,.15)',
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// Minimal wrapper export so the page import resolves during build.
// This avoids breaking the build while the full CommandsLibrary component
// is being integrated. It provides a simple UI and calls the passed
// handlers (onBack, onToggleLearned) so navigation still works.
export default function CommandsLibrary({ user, onLogout, onBack, learnedCommands = [], onToggleLearned = () => {} }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', padding: '2rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <button onClick={onBack} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>← Back</button>
        </div>
        <div>
          {user && (
            <button onClick={onLogout} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)' }}>Sign out</button>
          )}
        </div>
      </nav>

      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Commands Library</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>A lightweight commands library. The full UI will be available soon.</p>

      <div style={{ display: 'grid', gap: 12 }}>
        {learnedCommands.length === 0 ? (
          <div style={{ padding: 16, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            No commands learned yet. Explore curriculum to mark commands as learned.
          </div>
        ) : (
          learnedCommands.slice(0, 20).map((id) => (
            <div key={id} style={{ padding: 12, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>Command {id}</div>
              <button onClick={() => onToggleLearned(id)} style={{ padding: '6px 10px', borderRadius: 8 }}>Unmark</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
