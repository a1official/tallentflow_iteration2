import React, { useState, useEffect } from 'react';
import AssessmentCard from './AssessmentCard';
import AssessmentBuilder from './AssessmentBuilder';
import AssessmentResults from './AssessmentResults';

const AssessmentsHome = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewingResultsOf, setViewingResultsOf] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/assessments');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load assessments');
        setAssessments(data.items || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeploy = (assessmentId) => {
    const jobId = prompt('Enter the Job ID to deploy this assessment to:');
    if (jobId) {
      console.log(`Deploying assessment ${assessmentId} to job ${jobId}`);
      alert(`Assessment ${assessmentId} deployed to Job ID: ${jobId}`);
    }
  };

  const handleViewResults = (assessmentId) => {
    setViewingResultsOf(assessmentId);
  };

  if (showBuilder) {
    return <AssessmentBuilder />;
  }

  if (viewingResultsOf) {
    return (
      <div>
        <button className="btn" onClick={() => setViewingResultsOf(null)}>
          &larr; Back to Assessments
        </button>
        <AssessmentResults assessmentId={viewingResultsOf} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Assessments</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowBuilder(true)}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
        >
          Create New Assessment
        </button>
      </div>
      {loading ? (
        <div className="card" style={{ padding: '1rem', marginTop: '1rem', textAlign: 'center' }}>Loading...</div>
      ) : error ? (
        <div className="card" style={{ padding: '1rem', marginTop: '1rem', color: 'red', textAlign: 'center' }}>Error: {error}</div>
      ) : (
        <div>
          {assessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              onDeploy={handleDeploy}
              onViewResults={handleViewResults}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentsHome;
