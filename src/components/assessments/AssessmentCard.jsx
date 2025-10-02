import React from 'react';
import './AssessmentCard.css';

const AssessmentCard = ({ assessment, onDeploy, onViewResults }) => {
  const roundsCount = Array.isArray(assessment.rounds)
    ? assessment.rounds.length
    : Array.isArray(assessment.sections)
    ? assessment.sections.length
    : 0;
  return (
    <div className="assessment-card">
      <h3>{assessment.title}</h3>
      <div className="assessment-card-details">
        <p>{roundsCount} Rounds</p>
      </div>
      <div className="assessment-card-actions">
        <button className="btn btn-secondary" onClick={() => onViewResults(assessment.id)}>
          View Results
        </button>
        <button className="btn btn-primary" onClick={() => onDeploy(assessment)}>
          Deploy
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;
