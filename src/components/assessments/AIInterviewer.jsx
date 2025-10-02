import React, { useEffect, useMemo, useRef, useState } from 'react'

const hasSpeech = () => 'speechSynthesis' in window
const hasRecognition = () => {
  return (
    typeof window !== 'undefined' && (
      window.SpeechRecognition || window.webkitSpeechRecognition
    )
  )
}

export default function AIInterviewer({ jobId, config = {}, onComplete }) {
  const [step, setStep] = useState('idle') // idle | speaking | listening | done
  const [index, setIndex] = useState(-1)
  const [transcripts, setTranscripts] = useState([])
  const [error, setError] = useState(null)
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)

  const questions = useMemo(() => config?.questions || [], [config])
  const intro = config?.intro || 'Welcome to your interview.'
  const voiceLang = config?.voice || 'en-US'

  useEffect(() => {
    if (hasRecognition()) {
      const Rec = window.SpeechRecognition || window.webkitSpeechRecognition
      const rec = new Rec()
      rec.lang = voiceLang
      rec.continuous = false
      rec.interimResults = false
      rec.maxAlternatives = 1

      rec.onstart = () => setListening(true)
      rec.onend = () => setListening(false)
      rec.onerror = (e) => setError(e.error || 'Speech recognition error')
      rec.onresult = (e) => {
        const text = e.results[0][0].transcript
        setTranscripts((prev) => {
          const next = prev.slice()
          next[index] = text
          return next
        })
        setStep('idle')
      }

      recRef.current = rec
    }
  }, [voiceLang, index])

  const speak = (text) => {
    if (!hasSpeech()) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = voiceLang
    utter.onend = () => setStep('idle')
    window.speechSynthesis.speak(utter)
  }

  const startInterview = () => {
    setTranscripts(Array(questions.length).fill(''))
    setError(null)
    setIndex(-1)
    setStep('idle')
    // Speak intro then first question
    if (hasSpeech()) speak(intro)
  }

  useEffect(() => {
    if (step === 'idle' && index < 0 && questions.length > 0) {
      // after intro, proceed to Q0
      const id = setTimeout(() => nextQuestion(), 800)
      return () => clearTimeout(id)
    }
  }, [step])

  const nextQuestion = () => {
    const nextIdx = index + 1
    if (nextIdx >= questions.length) {
      setStep('done')
      return
    }
    setIndex(nextIdx)
    setError(null)
    if (hasSpeech()) {
      setStep('speaking')
      speak(questions[nextIdx])
    }
  }

  const startListening = () => {
    if (!recRef.current) {
      setError('Speech recognition not supported in this browser')
      return
    }
    setError(null)
    setStep('listening')
    recRef.current.start()
  }

  const submit = async () => {
    try {
      const payload = {
        candidateId: 0,
        answers: transcripts.map((t, i) => ({ question: questions[i], transcript: t }))
      }
      const res = await fetch(`/api/assessments/${jobId}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      if (onComplete) onComplete(data)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card" style={{ display: 'grid', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>AI Interviewer</h3>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>Mode: {step}{listening ? ' (listening)' : ''}</div>
      </div>

      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.5rem', borderRadius: 6, border: '1px solid #f5c6cb' }}>
          ❌ {error}
        </div>
      )}

      {index < 0 ? (
        <div>
          <p style={{ marginTop: 0 }}>{intro}</p>
          <button className="btn btn-primary" onClick={startInterview}>Start Interview</button>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Question {index + 1} of {questions.length}</div>
          <div style={{ marginBottom: 8 }}>{questions[index]}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={nextQuestion}>Skip</button>
            <button className="btn btn-primary" onClick={startListening}>Answer</button>
          </div>
        </div>
      )}

      {transcripts.some(Boolean) && (
        <div className="card" style={{ background: '#fff', border: '1px solid #eee' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Your Responses</div>
          <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {transcripts.map((t, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>{questions[i]}</div>
                <div>{t || <em style={{ color: '#999' }}>No answer</em>}</div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {step === 'done' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn" onClick={()=> setIndex(Math.max(0, questions.length - 1))}>Review</button>
          <button className="btn btn-primary" onClick={submit}>Submit Interview</button>
        </div>
      )}
    </div>
  )
}
