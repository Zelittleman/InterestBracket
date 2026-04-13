import React, { useState, useMemo } from 'react';

interface BracketProps {
  interests: string[];
  onReset: () => void;
}

type Matchup = {
  a: string | null;
  b: string | null;
  winner: string | null;
};

type BracketSide = {
  rounds: Matchup[][];
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildInitialSide(entries: string[]): BracketSide {
  // Round 1: 4 matchups from 8 entries
  const round1: Matchup[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    round1.push({ a: entries[i], b: entries[i + 1], winner: null });
  }
  // Rounds 2 and 3 are empty until winners advance
  return {
    rounds: [round1, [], []],
  };
}

const Bracket: React.FC<BracketProps> = ({ interests, onReset }) => {
  const shuffled = useMemo(() => shuffle(interests), [interests]);
  const leftEntries = shuffled.slice(0, 8);
  const rightEntries = shuffled.slice(8, 16);

  const [leftSide, setLeftSide] = useState<BracketSide>(() => buildInitialSide(leftEntries));
  const [rightSide, setRightSide] = useState<BracketSide>(() => buildInitialSide(rightEntries));
  const [finals, setFinals] = useState<Matchup>({ a: null, b: null, winner: null });
  const [champion, setChampion] = useState<string | null>(null);

  const getRoundLabel = (roundIndex: number, isFinals: boolean): string => {
    if (isFinals) return 'Finals';
    switch (roundIndex) {
      case 0: return 'Round 1';
      case 1: return 'Semifinals';
      case 2: return 'Side Final';
      default: return `Round ${roundIndex + 1}`;
    }
  };

  const pickWinner = (
    side: 'left' | 'right',
    roundIndex: number,
    matchIndex: number,
    winner: string
  ) => {
    const sideState = side === 'left' ? leftSide : rightSide;
    const setSide = side === 'left' ? setLeftSide : setRightSide;

    const newRounds = sideState.rounds.map((round) =>
      round.map((m) => ({ ...m }))
    );

    newRounds[roundIndex][matchIndex].winner = winner;

    // Advance winner to next round
    if (roundIndex < 2) {
      const nextRound = roundIndex + 1;
      const nextMatchIndex = Math.floor(matchIndex / 2);

      // Ensure next round matchup exists
      while (newRounds[nextRound].length <= nextMatchIndex) {
        newRounds[nextRound].push({ a: null, b: null, winner: null });
      }

      const slot = matchIndex % 2 === 0 ? 'a' : 'b';
      newRounds[nextRound][nextMatchIndex] = {
        ...newRounds[nextRound][nextMatchIndex],
        [slot]: winner,
      };
    }

    // If this is the side final (round 2), advance to finals
    if (roundIndex === 2) {
      setFinals((prev) => ({
        ...prev,
        [side === 'left' ? 'a' : 'b']: winner,
      }));
    }

    setSide({ rounds: newRounds });
  };

  const pickFinalsWinner = (winner: string) => {
    setFinals((prev) => ({ ...prev, winner }));
    setChampion(winner);
  };

  const renderMatchup = (
    matchup: Matchup,
    side: 'left' | 'right' | 'finals',
    roundIndex: number,
    matchIndex: number
  ) => {
    const isClickable = (option: string | null) =>
      option !== null && matchup.winner === null;

    const handleClick = (option: string) => {
      if (side === 'finals') {
        pickFinalsWinner(option);
      } else {
        pickWinner(side as 'left' | 'right', roundIndex, matchIndex, option);
      }
    };

    return (
      <div className={`matchup ${matchup.winner ? 'decided' : ''}`} key={`${side}-${roundIndex}-${matchIndex}`}>
        <button
          className={`matchup-option ${matchup.winner === matchup.a ? 'winner' : ''} ${matchup.winner && matchup.winner !== matchup.a ? 'loser' : ''}`}
          disabled={!isClickable(matchup.a)}
          onClick={() => matchup.a && handleClick(matchup.a)}
        >
          {matchup.a || '—'}
        </button>
        <span className="vs">vs</span>
        <button
          className={`matchup-option ${matchup.winner === matchup.b ? 'winner' : ''} ${matchup.winner && matchup.winner !== matchup.b ? 'loser' : ''}`}
          disabled={!isClickable(matchup.b)}
          onClick={() => matchup.b && handleClick(matchup.b)}
        >
          {matchup.b || '—'}
        </button>
      </div>
    );
  };

  const renderSide = (side: BracketSide, sideLabel: 'left' | 'right') => (
    <div className={`bracket-side ${sideLabel}`}>
      <h2>{sideLabel === 'left' ? 'Left Bracket' : 'Right Bracket'}</h2>
      <div className="rounds">
        {side.rounds.map((round, ri) => (
          <div className="round" key={ri}>
            <h3>{getRoundLabel(ri, false)}</h3>
            <div className="matchups">
              {round.length > 0
                ? round.map((m, mi) => renderMatchup(m, sideLabel, ri, mi))
                : <div className="waiting">Waiting for winners...</div>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bracket-page">
      <h1>Interest Bracket</h1>
      {champion && (
        <div className="champion-banner">
          🏆 Champion: <strong>{champion}</strong> 🏆
        </div>
      )}
      <div className="bracket-container">
        {renderSide(leftSide, 'left')}
        <div className="bracket-finals">
          <h2>Finals</h2>
          <div className="matchups">
            {finals.a && finals.b
              ? renderMatchup(finals, 'finals', 3, 0)
              : <div className="waiting">Waiting for side finalists...</div>
            }
          </div>
        </div>
        {renderSide(rightSide, 'right')}
      </div>
      <button className="reset-button" onClick={onReset}>
        Start Over
      </button>
    </div>
  );
};

export default Bracket;
