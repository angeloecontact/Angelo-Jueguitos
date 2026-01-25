import React from 'react';
import { WORD_LENGTH, MAX_GUESSES } from '../constants';
import { LetterStatus } from '../types';

interface GridProps {
  guesses: string[];
  currentGuess: string;
  turn: number;
  solution: string; // Used to determine colors for past guesses
}

interface TileProps {
  letter: string;
  status: LetterStatus;
  animate?: boolean;
}

const Tile: React.FC<TileProps> = ({ letter, status, animate }) => {
  let bgColor = 'bg-transparent';
  let borderColor = 'border-game-tileBorder';
  let textColor = 'text-white';

  if (status === 'correct') {
    bgColor = 'bg-game-correct';
    borderColor = 'border-game-correct';
  } else if (status === 'present') {
    bgColor = 'bg-game-present';
    borderColor = 'border-game-present';
  } else if (status === 'absent') {
    bgColor = 'bg-game-absent';
    borderColor = 'border-game-absent';
  } else if (letter) {
      borderColor = 'border-game-tileActive';
      // Pop animation happens on input
      textColor = 'text-white';
  }

  // Handle animation classes
  let animationClass = '';
  if (animate && letter) {
      animationClass = 'animate-pop';
  }
  if (status !== 'initial' && !animate) {
      // Reveal animation handled by parent delay usually, but simple approach here:
      animationClass = 'animate-flip';
  }

  return (
    <div
      className={`w-14 h-14 border-2 flex items-center justify-center text-3xl font-bold uppercase select-none transition-colors duration-500 ${bgColor} ${borderColor} ${textColor} ${animationClass}`}
    >
      {letter}
    </div>
  );
};

export const Grid: React.FC<GridProps> = ({ guesses, currentGuess, turn, solution }) => {
  const empties = Array.from({ length: MAX_GUESSES - 1 - turn }).map((_, i) => i);

  return (
    <div className="grid grid-rows-6 gap-1.5 mb-2">
      {/* Completed rows */}
      {guesses.map((guess, i) => (
        <Row key={i} word={guess} solution={solution} isCompleted={true} />
      ))}

      {/* Current row */}
      {turn < MAX_GUESSES && (
        <Row key={turn} word={currentGuess} solution={solution} isCompleted={false} />
      )}

      {/* Empty rows */}
      {empties.map((_, i) => (
        <Row key={MAX_GUESSES + i} word="" solution={solution} isCompleted={false} isEmpty={true} />
      ))}
    </div>
  );
};

const Row: React.FC<{ word: string; solution: string; isCompleted: boolean; isEmpty?: boolean }> = ({
  word,
  solution,
  isCompleted,
  isEmpty
}) => {
  const letters = word.split('');
  const emptyCells = Array.from({ length: WORD_LENGTH - letters.length });

  // If completed, calculate colors.
  // Note: Simple logic for coloring. 'word' is the guess.
  const getStatus = (index: number, letter: string): LetterStatus => {
      if (!isCompleted) return 'initial';

      if (letter === solution[index]) return 'correct';
      if (solution.includes(letter)) return 'present';
      return 'absent';
  };
  
  // Advanced logic for duplicate letters handling (standard Wordle logic)
  const getColors = () => {
     if (!isCompleted) return Array(WORD_LENGTH).fill('initial');
     
     const solChars = solution.split('');
     const guessChars = word.split('');
     const statuses: LetterStatus[] = Array(WORD_LENGTH).fill('absent');

     // First pass: Correct
     guessChars.forEach((char, i) => {
         if (char === solChars[i]) {
             statuses[i] = 'correct';
             solChars[i] = '#'; // Mark as used
         }
     });

     // Second pass: Present
     guessChars.forEach((char, i) => {
         if (statuses[i] !== 'correct') {
             const indexInSol = solChars.indexOf(char);
             if (indexInSol > -1) {
                 statuses[i] = 'present';
                 solChars[indexInSol] = '#';
             }
         }
     });
     return statuses;
  }

  const rowColors = getColors();

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {letters.map((letter, i) => (
        <Tile key={i} letter={letter} status={rowColors[i]} animate={!isCompleted && i === letters.length -1} />
      ))}
      {emptyCells.map((_, i) => (
        <Tile key={`empty-${i}`} letter="" status="initial" />
      ))}
    </div>
  );
};
