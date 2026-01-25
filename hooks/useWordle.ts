import { useState, useCallback } from 'react';
import { WORD_LENGTH, MAX_GUESSES, VALID_WORDS } from '../constants';
import { GameStatus, LetterStatus } from '../types';

export const useWordle = (solution: string, onGuessMade?: (word: string) => void) => {
  const [turn, setTurn] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]); 
  const [history, setHistory] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [status, setStatus] = useState<GameStatus>(GameStatus.Playing);
  const [usedKeys, setUsedKeys] = useState<Record<string, LetterStatus>>({});
  const [message, setMessage] = useState('');

  // Re-calculate keys based on current guesses history
  const refreshUsedKeys = (currentGuesses: string[]) => {
    const newKeys: Record<string, LetterStatus> = {};
    const solChars = solution.split('');

    currentGuesses.forEach(guess => {
        const guessChars = guess.split('');
        guessChars.forEach((char, i) => {
            let currentColor = newKeys[char];

            if (solChars[i] === char) {
                newKeys[char] = 'correct';
                return;
            }
            if (solChars.includes(char)) {
                if (currentColor !== 'correct') {
                    newKeys[char] = 'present';
                }
                return;
            }
            if (currentColor !== 'correct' && currentColor !== 'present') {
                newKeys[char] = 'absent';
            }
        });
    });
    setUsedKeys(newKeys);
  };

  // Internal helper to process a committed word
  const processGuess = (guessWord: string) => {
      if (guessWord === solution) {
        setIsCorrect(true);
        setStatus(GameStatus.Won);
        setMessage('¡Correcto!');
      } else {
        if (turn >= MAX_GUESSES - 1) {
            setStatus(GameStatus.Lost);
            setMessage(`La palabra era: ${solution}`);
        }
      }

      const newGuesses = [...guesses, guessWord];
      setGuesses(newGuesses);
      setHistory([...history, guessWord]);
      setTurn(prev => prev + 1);
      refreshUsedKeys(newGuesses);
  };

  const addExternalGuess = useCallback((word: string) => {
      if (status !== GameStatus.Playing) return;
      if (guesses.includes(word)) return; // Avoid duplicates if race condition
      
      processGuess(word);
      // We do NOT reset currentGuess here necessarily, or maybe we should?
      // If Player A is typing "BAR..." and Player B sends "AVION", 
      // standard UX is usually to keep Player A's typing or clear it. 
      // Let's clear it to avoid confusion of where the row is.
      setCurrentGuess('');
  }, [guesses, status, solution, turn]); // Deps

  const onChar = useCallback((char: string) => {
      if (status !== GameStatus.Playing) return;
      if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => prev + char);
      }
  }, [currentGuess, status]);

  const onDelete = useCallback(() => {
      if (status !== GameStatus.Playing) return;
      setCurrentGuess((prev) => prev.slice(0, -1));
  }, [status]);

  const onEnter = useCallback(() => {
      if (status !== GameStatus.Playing) return;
      
      if (currentGuess.length !== WORD_LENGTH) {
          setMessage('Faltan letras');
          setTimeout(() => setMessage(''), 1500);
          return;
      }
      if (!VALID_WORDS.has(currentGuess)) {
           setMessage('No está en la lista');
           setTimeout(() => setMessage(''), 1500);
           return; 
      }

      // Valid Local Guess
      processGuess(currentGuess);
      
      // Notify Parent (Multiplayer)
      if (onGuessMade) {
          onGuessMade(currentGuess);
      }

      setCurrentGuess('');
  }, [currentGuess, status, solution, onGuessMade]);

  return {
    turn,
    currentGuess,
    guesses,
    isCorrect,
    usedKeys,
    onChar,
    onDelete,
    onEnter,
    addExternalGuess, // Exposed for multiplayer
    status,
    message,
    reset: () => {
        setTurn(0);
        setCurrentGuess('');
        setGuesses([]);
        setHistory([]);
        setIsCorrect(false);
        setStatus(GameStatus.Playing);
        setUsedKeys({});
        setMessage('');
    }
  };
};
