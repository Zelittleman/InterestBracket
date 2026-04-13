import React, { useState } from 'react';

interface InterestEntryProps {
  onSubmit: (interests: string[]) => void;
}

const InterestEntry: React.FC<InterestEntryProps> = ({ onSubmit }) => {
  const [interests, setInterests] = useState<string[]>(Array(16).fill(''));
  const [errors, setErrors] = useState<boolean[]>(Array(16).fill(false));

  const handleChange = (index: number, value: string) => {
    const updated = [...interests];
    updated[index] = value;
    setInterests(updated);

    if (value.trim() !== '') {
      const updatedErrors = [...errors];
      updatedErrors[index] = false;
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = () => {
    const newErrors = interests.map((val) => val.trim() === '');
    setErrors(newErrors);

    if (newErrors.some((e) => e)) {
      return;
    }

    onSubmit(interests.map((i) => i.trim()));
  };

  return (
    <div className="interest-entry">
      <h1>Enter 16 Personal Interests</h1>
      <p className="subtitle">Fill in all 16 interests to build your bracket!</p>
      <div className="interest-grid">
        {interests.map((val, i) => (
          <div key={i} className={`interest-input-wrapper ${errors[i] ? 'has-error' : ''}`}>
            <label htmlFor={`interest-${i}`}>{i + 1}.</label>
            <input
              id={`interest-${i}`}
              type="text"
              placeholder={`Interest #${i + 1}`}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              className={errors[i] ? 'error' : ''}
              maxLength={50}
            />
            {errors[i] && <span className="error-msg">Required</span>}
          </div>
        ))}
      </div>
      <button className="next-button" onClick={handleSubmit}>
        Next →
      </button>
    </div>
  );
};

export default InterestEntry;
