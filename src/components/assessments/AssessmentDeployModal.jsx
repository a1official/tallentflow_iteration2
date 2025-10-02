import React, { useEffect, useMemo, useState } from 'react'

export default function AssessmentDeployModal({ isOpen, assessment, onClose, onDeployed }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [deploying, setDeploying] = useState(false)

  useEffect(() => {
    if (!isOpen) return
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
      const payload = {
        ...rest,
        jobId: selectedJobId,
        updatedAt: new Date().toISOString(),
        isActive: true
      }
      const res = await fetch(`/api/assessments/${selectedJobId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to deploy assessment')
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn" onClick={onClose} disabled={deploying} style={{ background: '#6c757d', color: 'white' }}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={!selectedJobId || deploying}
          >
            {deploying ? 'Deploying…' : 'Deploy to Selected Job'}
          </button>
        </div>
      </div>
    </div>
  )
}
