import React, { useState } from 'react';
import InterestEntry from './InterestEntry';
import Bracket from './Bracket';
import './App.css';

function App() {
  const [interests, setInterests] = useState<string[] | null>(null);

  const handleSubmit = (items: string[]) => {
    setInterests(items);
  };

  const handleReset = () => {
    setInterests(null);
  };

  return (
    <div className="App">
      {interests === null ? (
        <InterestEntry onSubmit={handleSubmit} />
      ) : (
        <Bracket interests={interests} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
