import React, { useState, useEffect } from 'react';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { Modal } from './components/Modal';
import { useWordle } from './hooks/useWordle';
import { useMultiplayer } from './hooks/useMultiplayer';
import { getWordFromCategory, getMultiplayerWord } from './services/geminiService';
import { GameStatus, GameMode, PlayerInfo } from './types';
import { BarChart3, Settings, HelpCircle, Users, Loader2, Wifi } from 'lucide-react';

export default function App() {
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [lobbyOpen, setLobbyOpen] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [currentRoomCode, setCurrentRoomCode] = useState('');

  // Multiplayer Hook
  const { peers, connect, startGame, broadcastGuess, gameStarted, latestRemoteGuess, myInfo } = useMultiplayer();

  // Handler for when I make a guess locally
  const handleLocalGuess = (word: string) => {
      if (myInfo) {
          // If in multiplayer, broadcast it
          broadcastGuess(word);
      }
  };

  // Core Game Logic
  // We pass handleLocalGuess to be called when we successfully submit a word
  const wordle = useWordle(solution || 'AAAAA', handleLocalGuess);

  // Effect: When Multiplayer Game Starts signal received
  useEffect(() => {
    if (gameStarted) {
        setLobbyOpen(false); // Close lobby
        setLoading(true);
        
        let wordToUse = gameStarted.word;
        if (!wordToUse) {
             wordToUse = "ERROR";
        }

        setCategory(gameStarted.category);
        setSolution(wordToUse);
        setLoading(false);
        wordle.reset();
    }
  }, [gameStarted]);

  // Effect: Receive remote guesses from teammates
  useEffect(() => {
      if (latestRemoteGuess && myInfo && solution) {
          // Add the guess to our board
          wordle.addExternalGuess(latestRemoteGuess.word);
      }
  }, [latestRemoteGuess]);

  // Solo Mode Selection
  const handleSelectCategorySolo = async (cat: string) => {
    setShowStartModal(false);
    setLoading(true);
    setCategory(cat);
    const word = await getWordFromCategory(cat);
    setSolution(word);
    setLoading(false);
    wordle.reset();
  };

  // Multiplayer Join/Create
  const handleJoinMultiplayer = (name: string, code: string, isHost: boolean, cat: string) => {
      setCurrentRoomCode(code);
      setShowStartModal(false);
      setLobbyOpen(true);
      setCategory(cat);
      connect(code, name, isHost);
  };

  // Multiplayer Host Start Action
  const handleStartMultiplayerGame = async () => {
      if (!category || !myInfo?.isHost) return;
      
      setLoading(true);
      // Generate random valid word from local list for this session
      const word = getMultiplayerWord(category, Date.now().toString()); 
      startGame(word, category);
  };

  const handleRestart = () => {
    window.location.reload(); 
  };

  // Prevent background scrolling
  useEffect(() => {
     if (showStartModal || lobbyOpen || wordle.status !== GameStatus.Playing) {
         document.body.style.overflow = 'hidden';
     } else {
         document.body.style.overflow = 'unset';
     }
  }, [showStartModal, lobbyOpen, wordle.status]);

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between w-full max-w-[500px] px-4 py-3 border-b border-zinc-800">
        <div className="flex gap-2">
            <HelpCircle className="text-zinc-500 cursor-pointer hover:text-white transition-colors" size={24} />
        </div>
        <div className="flex flex-col items-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-white">
                LA PALABRA
            </h1>
            {myInfo && !showStartModal && !lobbyOpen && (
                 <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded-full border border-green-900/50">
                    <Wifi size={10} />
                    <span>EN VIVO</span>
                </div>
            )}
        </div>
        <div className="flex gap-2">
            <BarChart3 className="text-zinc-500 cursor-pointer hover:text-white transition-colors" size={24} />
            <Settings className="text-zinc-500 cursor-pointer hover:text-white transition-colors" size={24} />
        </div>
      </header>
      
      {/* Info Bar */}
      <div className="w-full max-w-[500px] flex justify-between items-center px-4 mt-2 h-6">
          {category && !loading && !lobbyOpen && (
              <div className="text-xs text-zinc-400 uppercase tracking-widest border border-zinc-700 px-2 py-1 rounded-full">
                  <span className="text-green-500 font-bold">{category}</span>
              </div>
          )}
          {myInfo && !loading && !lobbyOpen && (
               <div className="text-xs text-zinc-500 flex items-center gap-2">
                  <span className="text-white">{myInfo.name}</span>
                  <span className="bg-zinc-800 px-1 rounded text-[10px]">{peers.length} online</span>
              </div>
          )}
      </div>

      {/* Main Game Area */}
      <main className="flex-1 w-full max-w-[500px] flex flex-col items-center justify-center relative">
        
        {loading && (
            <div className="flex flex-col items-center justify-center text-zinc-400 animate-pulse">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p>Preparando partida...</p>
            </div>
        )}

        {solution && !loading && !lobbyOpen && (
            <>
                <div className={`absolute top-4 z-20 transition-opacity duration-300 ${wordle.message ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-white text-black px-4 py-2 rounded font-bold shadow-lg text-center">
                        {wordle.message}
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center w-full px-2">
                    <Grid 
                        currentGuess={wordle.currentGuess}
                        guesses={wordle.guesses}
                        turn={wordle.turn}
                        solution={solution}
                    />
                </div>
                
                <Keyboard 
                    onChar={wordle.onChar}
                    onDelete={wordle.onDelete}
                    onEnter={wordle.onEnter}
                    usedKeys={wordle.usedKeys}
                />
            </>
        )}
      </main>

      <Modal 
          type="start"
          isOpen={showStartModal}
          onSelectCategory={handleSelectCategorySolo}
          onJoinMultiplayer={handleJoinMultiplayer}
      />
      
      {lobbyOpen && (
        <Modal 
            type="lobby"
            isOpen={true}
            roomCode={currentRoomCode}
            players={peers}
            currentPlayer={myInfo}
            lobbyCategory={category || ''}
            onStartMultiplayerGame={handleStartMultiplayerGame}
        />
      )}

      <Modal 
          type="end"
          isOpen={wordle.status !== GameStatus.Playing && !showStartModal && !lobbyOpen && !!solution}
          win={wordle.status === GameStatus.Won}
          solution={solution || ''}
          message={wordle.status === GameStatus.Won ? '¡Excelente! Trabajo en equipo.' : undefined}
          roomCode={myInfo ? 'Partida Finalizada' : undefined}
          players={peers}
          onRestart={handleRestart}
      />
    </div>
  );
}
