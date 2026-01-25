import React, { useState, useEffect } from 'react';
import { Search, Users, Bot, ArrowRight, Play, Plus, KeyRound, Copy, Check, User, Crown, Loader2 } from 'lucide-react';
import { Category, GameMode, PlayerInfo } from '../types';
import { CATEGORY_TO_PREFIX, CATEGORY_CODES } from '../constants';

interface ModalProps {
  type: 'start' | 'end' | 'lobby';
  isOpen: boolean;
  // Solo Mode
  onSelectCategory?: (cat: string) => void;
  // Multi Mode
  onJoinMultiplayer?: (name: string, code: string, isHost: boolean, category: string) => void;
  onStartMultiplayerGame?: () => void;
  
  onRestart?: () => void;
  message?: string;
  solution?: string;
  win?: boolean;
  
  // Lobby Props
  roomCode?: string;
  players?: PlayerInfo[];
  currentPlayer?: PlayerInfo | null;
  lobbyCategory?: string;
}

const CATEGORIES: Category[] = ['General', 'Comida', 'Animales', 'Deportes', 'Tecnología', 'Viajes'];

export const Modal: React.FC<ModalProps> = ({ 
    type, isOpen, onSelectCategory, onJoinMultiplayer, onStartMultiplayerGame, 
    onRestart, message, solution, win, roomCode, players = [], currentPlayer, lobbyCategory
}) => {
  const [step, setStep] = useState<'mode' | 'multi-menu' | 'create-room' | 'join-room' | 'category'>('mode');
  const [customCat, setCustomCat] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
      if (!isOpen) {
          setTimeout(() => setStep('mode'), 300);
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModeSelect = (mode: GameMode) => {
      if (mode === 'multi') {
          setStep('multi-menu');
      } else {
          setStep('category');
      }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg('');

      if (!playerName.trim()) {
          setErrorMsg('Ingresa tu nombre');
          return;
      }
      const code = roomInput.trim().toUpperCase();
      if (!code) {
          setErrorMsg('Ingresa el código');
          return;
      }
      
      const parts = code.split('-');
      const category = CATEGORY_CODES[parts[0]];

      if (!category) {
          setErrorMsg('Código inválido.');
          return;
      }

      onJoinMultiplayer && onJoinMultiplayer(playerName.trim(), code, false, category);
  };

  const handleCreateSubmit = (cat: string) => {
     if (!playerName.trim()) {
         setErrorMsg('Ingresa tu nombre primero');
         return;
     }

     const prefix = CATEGORY_TO_PREFIX[cat];
     if (!prefix) return;

     const randomNum = Math.floor(1000 + Math.random() * 9000);
     const newCode = `${prefix}-${randomNum}`;
     
     onJoinMultiplayer && onJoinMultiplayer(playerName.trim(), newCode, true, cat);
  };

  const handleCategorySelect = (cat: string) => {
      onSelectCategory && onSelectCategory(cat);
  };

  const copyCode = () => {
      if (roomCode) {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl shadow-2xl max-w-md w-full animate-pop max-h-[90vh] overflow-y-auto">
        
        {type === 'start' && (
            <div className="text-center">
                {step === 'mode' && (
                    <>
                        <h2 className="text-3xl font-bold mb-6 text-white">La Palabra</h2>
                        <div className="space-y-4">
                            <button 
                                onClick={() => handleModeSelect('solo')}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-zinc-600 flex items-center gap-4 transition-all group"
                            >
                                <div className="bg-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-white">Modo Solitario</h3>
                                    <p className="text-zinc-400 text-sm">Juega contra la IA</p>
                                </div>
                                <ArrowRight className="ml-auto text-zinc-500 group-hover:text-white" />
                            </button>

                            <button 
                                onClick={() => handleModeSelect('multi')}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-zinc-600 flex items-center gap-4 transition-all group"
                            >
                                <div className="bg-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                                    <Users size={24} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-white">Sala Multijugador</h3>
                                    <p className="text-zinc-400 text-sm">Juega con amigos en vivo</p>
                                </div>
                                <ArrowRight className="ml-auto text-zinc-500 group-hover:text-white" />
                            </button>
                        </div>
                    </>
                )}

                {step === 'multi-menu' && (
                    <>
                         <h2 className="text-2xl font-bold mb-6 text-white">Multijugador</h2>
                         <div className="space-y-4">
                            <button 
                                onClick={() => setStep('create-room')}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-zinc-600 flex items-center gap-4 transition-all"
                            >
                                <div className="bg-purple-600 p-2 rounded-lg">
                                    <Plus size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-base font-bold text-white">Crear Sala</h3>
                                    <p className="text-zinc-400 text-xs">Sé el anfitrión</p>
                                </div>
                            </button>
                            <button 
                                onClick={() => setStep('join-room')}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-zinc-600 flex items-center gap-4 transition-all"
                            >
                                <div className="bg-orange-600 p-2 rounded-lg">
                                    <KeyRound size={20} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-base font-bold text-white">Unirse a Sala</h3>
                                    <p className="text-zinc-400 text-xs">Ingresa código</p>
                                </div>
                            </button>
                         </div>
                         <button onClick={() => setStep('mode')} className="text-zinc-500 text-sm mt-6 hover:text-white">
                            Volver
                        </button>
                    </>
                )}

                {step === 'create-room' && (
                     <>
                        <h2 className="text-xl font-bold mb-4 text-white">Configurar Sala</h2>
                        <input 
                            type="text" 
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Tu Nombre"
                            className="w-full bg-zinc-800 text-white rounded px-4 py-3 outline-none border border-zinc-600 focus:border-purple-500 mb-6 text-center"
                            maxLength={12}
                        />
                         {errorMsg && <p className="text-red-400 text-sm mb-4">{errorMsg}</p>}
                        
                        <p className="text-zinc-400 text-sm mb-3 text-left">Elige Categoría:</p>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => handleCreateSubmit(cat)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-600 hover:border-purple-500"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                       
                        <button onClick={() => setStep('multi-menu')} className="text-zinc-500 text-sm mt-4 hover:text-white">
                            Volver
                        </button>
                     </>
                )}

                {step === 'join-room' && (
                    <>
                        <h2 className="text-2xl font-bold mb-2 text-white">Unirse a Sala</h2>
                        <form onSubmit={handleJoinSubmit} className="space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tu Nombre</label>
                                <input 
                                    type="text" 
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Ej. Juan"
                                    className="w-full bg-zinc-800 text-white rounded px-4 py-3 outline-none border border-zinc-600 focus:border-blue-500"
                                    maxLength={12}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Código</label>
                                <input 
                                    type="text" 
                                    value={roomInput}
                                    onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                                    placeholder="Ej. ANI-1234"
                                    className="w-full bg-zinc-800 text-white rounded px-4 py-3 outline-none border border-zinc-600 focus:border-blue-500 font-mono tracking-widest uppercase"
                                    maxLength={10}
                                />
                            </div>
                            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                            
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                            >
                                Entrar <Play size={18} fill="currentColor" />
                            </button>
                        </form>
                        <button onClick={() => setStep('multi-menu')} className="text-zinc-500 text-sm mt-4 hover:text-white">
                            Volver
                        </button>
                    </>
                )}

                {step === 'category' && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-white">Elige una Categoría</h2>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => handleCategorySelect(cat)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition-colors border border-zinc-600 hover:border-zinc-500"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                         <div className="relative border-t border-zinc-700 pt-4">
                            <p className="text-zinc-400 text-sm mb-2">O escribe tu propia categoría:</p>
                            <form onSubmit={(e) => { e.preventDefault(); if(customCat.trim()) handleCategorySelect(customCat.trim()); }} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={customCat}
                                    onChange={(e) => setCustomCat(e.target.value)}
                                    placeholder="Ej. Star Wars..."
                                    className="flex-1 bg-zinc-800 text-white rounded px-3 py-2 outline-none border border-zinc-600 focus:border-green-500"
                                    maxLength={20}
                                />
                                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors">
                                    <Search size={20} />
                                </button>
                            </form>
                        </div>
                        <button onClick={() => setStep('mode')} className="text-zinc-500 text-sm mt-4 hover:text-white">
                            Volver
                        </button>
                    </>
                )}
            </div>
        )}

        {type === 'lobby' && (
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="bg-purple-900/50 text-purple-300 text-xs px-2 py-1 rounded border border-purple-700 uppercase font-bold tracking-wider">
                        {lobbyCategory || 'Sala'}
                    </span>
                    <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded border border-blue-700 flex items-center gap-1">
                        <Users size={12} /> {players.length}
                    </span>
                </div>
                
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 mb-6 relative group cursor-pointer" onClick={copyCode}>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">CÓDIGO DE SALA</p>
                    <p className="text-3xl font-mono font-bold text-white tracking-wider">{roomCode}</p>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-white transition-colors">
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 max-h-[200px] overflow-y-auto">
                    <h3 className="text-left text-xs font-bold text-zinc-500 uppercase mb-3 border-b border-zinc-700 pb-2">
                        Jugadores en línea
                    </h3>
                    <div className="space-y-2">
                        {players.map((p) => (
                            <div key={p.id} className={`flex items-center gap-3 p-2 rounded ${p.id === currentPlayer?.id ? 'bg-zinc-700/50' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${p.isHost ? 'bg-purple-600 text-white' : 'bg-zinc-600 text-zinc-300'}`}>
                                    {p.name.substring(0,2).toUpperCase()}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        {p.name}
                                        {p.isHost && <Crown size={12} className="text-yellow-500" />}
                                        {p.id === currentPlayer?.id && <span className="text-[10px] text-zinc-400">(Tú)</span>}
                                    </p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                        ))}
                        {players.length === 0 && <p className="text-zinc-500 text-sm">Conectando...</p>}
                    </div>
                </div>

                {currentPlayer?.isHost ? (
                    <button 
                        onClick={onStartMultiplayerGame}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-900/20"
                    >
                        INICIAR PARTIDA
                    </button>
                ) : (
                    <div className="text-zinc-400 text-sm flex flex-col items-center justify-center p-4 bg-zinc-800/30 rounded-lg">
                        <Loader2 className="animate-spin mb-2 text-zinc-500" />
                        <p>Esperando que el anfitrión inicie...</p>
                    </div>
                )}
            </div>
        )}

        {type === 'end' && (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2 text-white">
                    {win ? '¡Ganaste!' : 'Fin del Juego'}
                </h2>
                {message && <p className="text-zinc-300 mb-4">{message}</p>}
                
                <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-400 uppercase tracking-wider mb-1">La palabra era</p>
                    <p className="text-3xl font-bold text-green-400 tracking-widest">{solution}</p>
                </div>

                {roomCode && (
                     <div className="mb-6">
                        <p className="text-zinc-500 text-sm mb-2">Resultados de la Sala:</p>
                        {/* Placeholder for scoreboard if implemented, just visual for now */}
                        <div className="flex justify-center flex-wrap gap-2">
                            {players.map(p => (
                                <span key={p.id} className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400 border border-zinc-700">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    onClick={onRestart}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                >
                    Jugar de nuevo
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
