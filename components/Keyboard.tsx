import React, { useEffect } from 'react';
import { KEYBOARD_ROWS } from '../constants';
import { LetterStatus } from '../types';
import { Delete } from 'lucide-react';

interface KeyboardProps {
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  usedKeys: Record<string, LetterStatus>;
}

export const Keyboard: React.FC<KeyboardProps> = ({ onChar, onDelete, onEnter, usedKeys }) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onEnter();
      } else if (e.key === 'Backspace') {
        onDelete();
      } else {
        const key = e.key.toUpperCase();
        if (/^[A-ZÑ]$/.test(key)) {
          onChar(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChar, onDelete, onEnter]);

  const getKeyStyle = (key: string) => {
    const status = usedKeys[key];
    let base = "flex items-center justify-center rounded font-bold text-xs sm:text-sm cursor-pointer select-none transition-colors h-14 ";
    
    // Width logic: Standard keys are flex-1, Enter/Del are wider
    if (key === 'ENTER' || key === 'DEL') {
       base += " px-3 sm:px-4 text-xs"; 
    } else {
       base += " flex-1 mx-0.5";
    }

    if (status === 'correct') return base + " bg-game-correct text-white border-game-correct";
    if (status === 'present') return base + " bg-game-present text-white border-game-present";
    if (status === 'absent') return base + " bg-game-absent text-white border-game-absent";

    return base + " bg-game-key text-white hover:bg-zinc-600";
  };

  return (
    <div className="w-full max-w-[500px] px-2 pb-4">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex justify-center mb-2 gap-1 w-full">
          {i === 2 && (
             <button onClick={onEnter} className={`${getKeyStyle('ENTER')} w-[15%]`}>
               ENTER
             </button>
          )}
          
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onChar(key)}
              className={getKeyStyle(key)}
            >
              {key}
            </button>
          ))}

          {i === 2 && (
             <button onClick={onDelete} className={`${getKeyStyle('DEL')} w-[15%]`}>
               <Delete size={20} />
             </button>
          )}
        </div>
      ))}
    </div>
  );
};
