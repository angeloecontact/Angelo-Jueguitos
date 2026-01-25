export type LetterStatus = 'correct' | 'present' | 'absent' | 'initial';

export interface TileData {
  key: string;
  status: LetterStatus;
}

export interface Guess {
  word: string;
  isCompleted: boolean;
}

export interface GameStats {
  win: boolean;
  solution: string;
  guesses: number;
}

export enum GameStatus {
  Playing = 'PLAYING',
  Won = 'WON',
  Lost = 'LOST',
  Lobby = 'LOBBY' // New status for waiting room
}

export type Category = 'General' | 'Comida' | 'Animales' | 'Deportes' | 'Tecnología' | 'Viajes' | 'Custom';

export type GameMode = 'solo' | 'multi';

export interface PlayerInfo {
  id: string;
  name: string;
  isHost: boolean;
}
