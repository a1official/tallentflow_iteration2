import React, { useEffect, useMemo, useState } from 'react'

export default function AssessmentDeployModal({ isOpen, assessment, onClose, onDeployed }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [deploying, setDeploying] = useState(false)
  const [tab, setTab] = useState('assessment') // 'assessment' | 'ai'
  const [geminiKey, setGeminiKey] = useState('')
  const [aiIntro, setAiIntro] = useState('Welcome! I will ask a few questions about your experience. Answer clearly and concisely.')
  const [aiQuestions, setAiQuestions] = useState(['Tell me about your most impactful project.','How do you approach debugging complex issues?','Describe a time you improved performance in an app.'])
  const [aiVoice, setAiVoice] = useState('en-US')

  useEffect(() => {
    if (!isOpen) return
    const savedKey = localStorage.getItem('tf_gemini_api_key') || ''
    setGeminiKey(savedKey)
    const loadJobs = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/jobs?status=active&page=1&pageSize=1000&sortBy=createdAt&sortOrder=desc')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load jobs')
        setJobs(Array.isArray(data.items) ? data.items : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [isOpen])

  useEffect(() => {
    // Reset state when opening/closing
    if (!isOpen) {
      setSearch('')
      setSelectedJobId(null)
      setError(null)
    }
  }, [isOpen])

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter(j => (
      (j.title || '').toLowerCase().includes(q) ||
      (j.department || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q) ||
      (j.tags || []).join(' ').toLowerCase().includes(q)
    ))
  }, [jobs, search])

  const handleDeploy = async () => {
    if (!selectedJobId || !assessment) return
    setDeploying(true)
    setError(null)

    try {
      const { id, jobId: _ignoreJob, createdAt, updatedAt, ...rest } = assessment
      const base = {
        ...rest,
        jobId: selectedJobId,
        updatedAt: new Date().toISOString(),
        isActive: true
      }

      let payload = base
      if (tab === 'ai') {
        // Save key locally for HR only (not stored on server)
        localStorage.setItem('tf_gemini_api_key', geminiKey || '')
        payload = {
          ...base,
          aiInterviewerEnabled: true,
          aiConfig: {
            provider: 'gemini',
            voice: aiVoice,
            intro: aiIntro,
            questions: aiQuestions.filter(Boolean)
          }
        }
      }

      const res = await fetch(`/api/assessments/${selectedJobId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to deploy')
      if (onDeployed) onDeployed(selectedJobId)
      if (onClose) onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeploying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
        width: '95%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Deploy Assessment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>×</button>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>Assessment</div>
            <div style={{ fontWeight: 600 }}>{assessment?.title}</div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#f8d7da', color: '#721c24', padding: '0.75rem',
            borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f5c6cb'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.5rem' }}>
          <div style={{ display: 'inline-flex', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <button onClick={() => setTab('assessment')} className="btn" style={{ background: tab==='assessment' ? '#007bff' : 'white', color: tab==='assessment' ? 'white' : '#333' }}>Assessment</button>
            <button onClick={() => setTab('ai')} className="btn" style={{ background: tab==='ai' ? '#007bff' : 'white', color: tab==='ai' ? 'white' : '#333' }}>AI Interviewer</button>
          </div>
        </div>

        {/* Job Picker */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
            <input
              type="text"
              placeholder="Search jobs by title, department, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>No jobs found</div>
            ) : (
              filteredJobs.map(job => (
                <label key={job.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem',
                  border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="selectedJob"
                    checked={selectedJobId === job.id}
                    onChange={() => setSelectedJobId(job.id)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600 }}>{job.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#999' }}>{job.createdAt && new Date(job.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.25rem' }}>
                      {job.department} • {job.location} • {job.experienceLevel}
                    </div>
                    {(job.tags && job.tags.length > 0) && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {job.tags.slice(0, 4).map((t, i) => (
                          <span key={i} style={{ background: '#e9ecef', padding: '2px 6px', borderRadius: '12px', fontSize: '0.75rem' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {tab==='ai' && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Gemini API Key (stored locally)</label>
                <input type="password" value={geminiKey} onChange={(e)=>setGeminiKey(e.target.value)} placeholder="AIza..." style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:6 }} />
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>Your key is saved in this browser only and is not sent to the server.</div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Intro Prompt</label>
                <input type="text" value={aiIntro} onChange={(e)=>setAiIntro(e.target.value)} style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:6 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Questions</label>
                {aiQuestions.map((q,i)=> (
                  <input key={i} type="text" value={q} onChange={(e)=>{
                    const next = aiQuestions.slice(); next[i]=e.target.value; setAiQuestions(next);
                  }} placeholder={`Question ${i+1}`} style={{ width:'100%', padding:'0.5rem', border:'1px solid #ddd', borderRadius:6, marginBottom: 6 }} />
                ))}
                <button type="button" className="btn" onClick={()=> setAiQuestions([...aiQuestions, ''])}>+ Add Question</button>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Voice</label>
                <select value={aiVoice} onChange={(e)=>setAiVoice(e.target.value)} style={{ padding:'0.5rem', border:'1px solid #ddd', borderRadius:6 }}>
                  <option value="en-US">en-US</option>
                  <option value="en-GB">en-GB</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn" onClick={onClose} disabled={deploying} style={{ background: '#6c757d', color: 'white' }}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={!selectedJobId || deploying}
          >
            {deploying ? 'Deploying…' : (tab==='ai' ? 'Deploy AI Interviewer' : 'Deploy Assessment')}
          </button>
        </div>
      </div>
    </div>
  )
}
