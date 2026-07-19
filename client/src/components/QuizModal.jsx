import React, { useState } from 'react';

export default function QuizModal({ quiz, lessonId, onClose, onResult }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === quiz.correct;

  const handleSubmit = async () => {
    if (selected === null) return;
    setSubmitted(true);

    // Save result
    try {
      await fetch('/api/progress/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId, question: quiz.question, correct: selected === quiz.correct }),
      });
    } catch (e) { /* ignore */ }

    onResult?.(selected === quiz.correct);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border-bright)',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px',
        animation: 'fadeIn 0.25s ease',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🎯</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Quick Quiz</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test your understanding</div>
          </div>
        </div>

        {/* Question */}
        <p style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.2rem', color: 'var(--text)' }}>
          {quiz.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {quiz.options.map((opt, i) => {
            let bg = 'var(--surface)';
            let border = 'var(--border)';
            let color = 'var(--text)';

            if (submitted) {
              if (i === quiz.correct) {
                bg = 'rgba(34,197,94,0.1)'; border = 'rgba(34,197,94,0.5)'; color = '#22c55e';
              } else if (i === selected && i !== quiz.correct) {
                bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.5)'; color = '#ef4444';
              }
            } else if (i === selected) {
              bg = 'rgba(249,115,22,0.1)'; border = 'var(--primary)'; color = 'var(--primary)';
            }

            return (
              <button
                key={i}
                onClick={() => !submitted && setSelected(i)}
                style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: '8px',
                  padding: '0.75rem 1rem', textAlign: 'left', cursor: submitted ? 'default' : 'pointer',
                  color, fontFamily: 'var(--sans)', fontSize: '0.9rem', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                }}
              >
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  background: i === selected ? border : 'transparent',
                  color: i === selected ? '#fff' : 'inherit',
                }}>
                  {submitted && i === quiz.correct ? '✓' : submitted && i === selected ? '✗' : 'ABCD'[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {submitted && (
          <div style={{
            background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.2rem',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.3rem', color: isCorrect ? '#22c55e' : '#ef4444' }}>
              {isCorrect ? '🎉 Correct!' : '❌ Not quite'}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              {quiz.explanation}
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
          {!submitted ? (
            <>
              <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: '0.85rem' }}>
                Skip
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={selected === null}
                style={{ fontSize: '0.85rem' }}
              >
                Submit Answer
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onClose} style={{ fontSize: '0.85rem' }}>
              Continue Learning →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
