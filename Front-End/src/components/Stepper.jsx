// src/components/Stepper.jsx
import React from 'react';
import './Stepper.css';

export default function Stepper({ currentStep = 0 }) {
  const steps = ['기본정보입력', '건강', '재정', '계산결과'];

  return (
    <div className="stepper-bar">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="step-item">
            <div className={`step-circle ${i === currentStep ? 'active' : ''}`}>{i + 1}</div>
            <div className={`step-label ${i === currentStep ? 'active' : ''}`}>{label}</div>
          </div>
          {i < steps.length - 1 && <div className="step-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}
