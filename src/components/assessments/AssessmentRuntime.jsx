import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PreAssessmentForm from './PreAssessmentForm';
import './AssessmentRuntime.css';

const keyFor = (jobId) => `assessment_answers_${jobId}`;
const deadlineKeyFor = (jobId) => `assessment_deadline_${jobId}`;

const AssessmentRuntime = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef();

  const handleFormSubmit = (details) => {
    setCandidate(details);
  };

  // Load assessment
  useEffect(() => {
    const load = async () => {
      if (!jobId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/assessments/${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load assessment');
        // Normalize sections
        const sections = Array.isArray(data.sections) && data.sections.length
          ? data.sections
          : (Array.isArray(data.rounds) ? data.rounds.map((r, idx) => ({ id: idx + 1, title: r.title || `Round ${idx+1}`, description: r.description || '', questions: r.questions || [] })) : []);
        setAssessment({ ...data, sections });
        // Load saved answers
        const saved = localStorage.getItem(keyFor(jobId));
        if (saved) setAnswers(JSON.parse(saved));
        // Setup deadline
        const existingDeadline = localStorage.getItem(deadlineKeyFor(jobId));
        if (existingDeadline) {
          setDeadline(new Date(existingDeadline).getTime());
        } else if (data.timeLimit) {
          const d = Date.now() + Number(data.timeLimit) * 60 * 1000;
          localStorage.setItem(deadlineKeyFor(jobId), new Date(d).toISOString());
          setDeadline(d);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  // Autosave
  useEffect(() => {
    if (!jobId) return;
    localStorage.setItem(keyFor(jobId), JSON.stringify(answers));
  }, [answers, jobId]);

  // Timer tick
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const ms = Math.max(0, deadline - Date.now());
      setRemaining(ms);
      if (ms === 0) {
        clearInterval(timerRef.current);
        handleSubmit(true);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [deadline]);

  const sections = useMemo(() => assessment?.sections || [], [assessment]);
  const totalQuestions = useMemo(() => sections.reduce((sum, s) => sum + (s.questions?.length || 0), 0), [sections]);
  const answeredCount = useMemo(() => Object.keys(answers).filter((k) => {
    const v = answers[k];
    return Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && String(v).trim() !== '');
  }).length, [answers]);

  const handleAnswerChange = (sectionIndex, questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [`${sectionIndex}-${questionIndex}`]: value }));
  };

  const toggleMark = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setMarked((m) => ({ ...m, [key]: !m[key] }));
  };

  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const handleSubmit = async (auto = false) => {
    if (!assessment) return;
    try {
      const payload = {
        candidateId: 0,
        answers,
      };
      const res = await fetch(`/api/assessments/${jobId}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      localStorage.removeItem(keyFor(jobId));
      localStorage.removeItem(deadlineKeyFor(jobId));
      alert(auto ? 'Time up! Assessment submitted.' : 'Assessment submitted successfully!');
      navigate('/jobs/applied');
    } catch (e) {
      alert(`Failed to submit: ${e.message}`);
    }
  };

  if (!candidate) {
    return <PreAssessmentForm onSubmit={handleFormSubmit} />;
  }

  return (
    <div className="runtime-container">
      <div className="runtime-header card">
        <div className="runtime-title">{assessment ? assessment.title : 'Assessment'}</div>
        <div className="runtime-meta">
          {remaining !== null && (
            <span className={`timer-pill ${remaining < 5 * 60 * 1000 ? 'warn' : ''}`}>
              ⏱️ {formatTime(remaining)}
            </span>
          )}
          <div className="progress">
            <div className="progress-bar" style={{ width: `${totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0}%` }} />
          </div>
          <div className="progress-text">{answeredCount}/{totalQuestions} answered</div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>Loading assessment...</div>
      ) : error ? (
        <div className="card" style={{ color: 'red', textAlign: 'center', padding: '1rem' }}>Error: {error}</div>
      ) : sections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>No sections found.</div>
      ) : (
        <div className="runtime-content">
          <aside className="section-nav card">
            <div className="section-nav-title">Sections</div>
            <ul className="section-list">
              {sections.map((s, idx) => (
                <li key={idx}>
                  <button
                    className={`section-item ${idx === currentSection ? 'active' : ''}`}
                    onClick={() => setCurrentSection(idx)}
                  >
                    <span className="section-name">{s.title || `Section ${idx+1}`}</span>
                    <span className="section-count">{s.questions?.length || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="question-area">
            <div className="card">
              <h3 className="section-heading">{sections[currentSection]?.title}</h3>
              <p className="section-desc">{sections[currentSection]?.description}</p>
            </div>

            {(sections[currentSection]?.questions || []).map((q, qIdx) => {
              const key = `${currentSection}-${qIdx}`;
              const val = answers[key];
              const isMarked = !!marked[key];
              const isAnswered = Array.isArray(val) ? val.length > 0 : (val !== undefined && val !== null && String(val).trim() !== '');
              return (
                <div key={qIdx} className={`question-card card ${isMarked ? 'marked' : ''} ${isAnswered ? 'answered' : ''}`}>
                  <div className="question-header">
                    <div className="question-title">{qIdx + 1}. {q.label || q.text}</div>
                    <div className="question-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => toggleMark(currentSection, qIdx)}>
                        {isMarked ? 'Unmark' : 'Mark for Review'}
                      </button>
                    </div>
                  </div>

                  <div className="question-body">
                    {q.type === 'single' && Array.isArray(q.options) && (
                      <div className="options-grid">
                        {q.options.map((opt, i) => (
                          <label key={i} className="option-item">
                            <input
                              type="radio"
                              name={`q-${key}`}
                              checked={val === opt}
                              onChange={() => handleAnswerChange(currentSection, qIdx, opt)}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'multi' && Array.isArray(q.options) && (
                      <div className="options-grid">
                        {q.options.map((opt, i) => {
                          const arr = Array.isArray(val) ? val : [];
                          const checked = arr.includes(opt);
                          return (
                            <label key={i} className="option-item">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const next = new Set(arr);
                                  if (e.target.checked) next.add(opt); else next.delete(opt);
                                  handleAnswerChange(currentSection, qIdx, Array.from(next));
                                }}
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'short' && (
                      <input
                        className="text-input"
                        type="text"
                        placeholder={q.placeholder || ''}
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(currentSection, qIdx, e.target.value)}
                      />
                    )}

                    {q.type === 'long' && (
                      <textarea
                        className="text-area"
                        rows={4}
                        placeholder={q.placeholder || ''}
                        value={val || ''}
                        onChange={(e) => handleAnswerChange(currentSection, qIdx, e.target.value)}
                      />
                    )}

                    {q.type === 'numeric' && (
                      <input
                        className="text-input"
                        type="number"
                        placeholder={q.placeholder || ''}
                        min={q.validation?.min}
                        max={q.validation?.max}
                        value={val ?? ''}
                        onChange={(e) => handleAnswerChange(currentSection, qIdx, e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            <div className="runtime-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentSection((i) => Math.max(0, i - 1))}
                disabled={currentSection === 0}
              >
                ← Previous
              </button>
              {currentSection < sections.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentSection((i) => Math.min(sections.length - 1, i + 1))}
                >
                  Next →
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => setShowReview(true)}>
                  Review & Submit
                </button>
              )}
              <button type="button" className="btn" onClick={() => setShowReview(true)}>
                Review
              </button>
            </div>
          </section>
        </div>
      )}

      {showReview && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '1rem 1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>Review Answers</h3>
              <button onClick={() => setShowReview(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
            </div>

            <div className="card" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div><strong>Total:</strong> {totalQuestions}</div>
                <div><strong>Answered:</strong> {answeredCount}</div>
                <div><strong>Unanswered:</strong> {totalQuestions - answeredCount}</div>
                <div><strong>Marked:</strong> {Object.values(marked).filter(Boolean).length}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {sections.map((s, sIdx) => (
                <div key={sIdx} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600 }}>{s.title || `Section ${sIdx + 1}`}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{s.questions?.length || 0} questions</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                    {(s.questions || []).map((q, qIdx) => {
                      const key = `${sIdx}-${qIdx}`;
                      const val = answers[key];
                      const isMarked = !!marked[key];
                      const isAnswered = Array.isArray(val) ? val.length > 0 : (val !== undefined && val !== null && String(val).trim() !== '');
                      return (
                        <div key={qIdx} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '8px', background: '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{qIdx + 1}.</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isMarked && <span title="Marked for review">🔖</span>}
                              {isAnswered ? <span title="Answered" style={{ color: '#28a745' }}>✔</span> : <span title="Unanswered" style={{ color: '#dc3545' }}>•</span>}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#555', margin: '6px 0' }}>{q.label || q.text}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => { setCurrentSection(sIdx); setShowReview(false); }}
                            >
                              Go to
                            </button>
                            <button
                              type="button"
                              className="btn"
                              onClick={() => toggleMark(sIdx, qIdx)}
                            >
                              {isMarked ? 'Unmark' : 'Mark'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button className="btn" onClick={() => setShowReview(false)} style={{ background: '#6c757d', color: '#fff' }}>Back</button>
              <button className="btn btn-primary" onClick={() => handleSubmit(false)}>Submit Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentRuntime;
