import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CandidatePortal.css';

// Mock function to fetch applied jobs for a candidate
const fetchAppliedJobs = async () => {
  // In a real app, this would be an API call
  return [
    { id: 1, title: 'Software Engineer', department: 'Technology', status: 'Applied', hasAssessment: true },
    { id: 2, title: 'Product Manager', department: 'Product', status: 'Under Review', hasAssessment: false },
    { id: 3, title: 'Data Scientist', department: 'Analytics', status: 'Applied', hasAssessment: true },
  ];
};

const CandidatePortal = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAppliedJobs = async () => {
      const jobs = await fetchAppliedJobs();
      setAppliedJobs(jobs);
      setLoading(false);
    };

    getAppliedJobs();
  }, []);

  if (loading) {
    return <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>Loading applied jobs...</div>;
  }

  return (
    <div>
      <div className="portal-header">
        <div>
          <h2 className="portal-title">Applied Jobs</h2>
          <div className="portal-subtitle">You have applied to {appliedJobs.length} job{appliedJobs.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="job-list">
        {appliedJobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-card-header">
              <h3 className="job-title">{job.title}</h3>
              <span className={`status-badge ${job.status === 'Applied' ? 'status-applied' : job.status === 'Under Review' ? 'status-review' : ''}`}>{job.status}</span>
            </div>

            <div className="job-card-details">
              <div className="detail-row">
                <span className="label">Department</span>
                <span className="dept-chip">{job.department}</span>
              </div>
              <div className="detail-row">
                <span className="label">Job ID</span>
                <span className="value">#{job.id}</span>
              </div>
            </div>

            <div className="job-card-actions">
              {job.hasAssessment ? (
                <Link to={`/assessment/${job.id}`} className="action-link">
                  <button className="btn btn-primary">Start Assessment</button>
                </Link>
              ) : (
                <span className="text-muted">No assessment available</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidatePortal;
