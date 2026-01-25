import { useState, useEffect, useRef } from 'react';
import { joinRoom } from 'trystero/torrent';
import { PlayerInfo } from '../types';

const APP_ID = 'la-palabra-del-dia-v1';

export const useMultiplayer = () => {
  const [peers, setPeers] = useState<PlayerInfo[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myInfo, setMyInfo] = useState<PlayerInfo | null>(null);
  const [gameStarted, setGameStarted] = useState<{ word: string, category: string } | null>(null);
  const [latestRemoteGuess, setLatestRemoteGuess] = useState<{ word: string, id: number } | null>(null);
  
  // Trystero room reference
  const roomRef = useRef<any>(null);
  const actionsRef = useRef<any>(null);

  const connect = (roomCode: string, name: string, isHost: boolean) => {
    const id = Math.random().toString(36).substring(2, 9);
    const me = { id, name, isHost };
    
    setMyInfo(me);
    setRoomId(roomCode);
    setPeers([me]); // Start with self

    // Initialize Trystero
    const room = joinRoom({ appId: APP_ID, roomId: roomCode }, { rootUrl: 'https://torrent.trystero.com' });
    roomRef.current = room;

    // Actions
    const [sendPresence, getPresence] = room.makeAction('presence');
    const [sendStart, getStart] = room.makeAction('start');
    const [sendGuess, getGuess] = room.makeAction('guess');
    
    actionsRef.current = { sendPresence, sendStart, sendGuess };

    // Listeners
    room.onPeerJoin((peerId: any) => {
        sendPresence(me);
    });

    room.onPeerLeave((peerId: any) => {
        // For simplicity in this demo, we don't strictly remove peers as IDs might mismatch 
        // without a robust map, but we could filter by timestamp if we added one.
        // We will rely on periodic presence updates to keep the list somewhat fresh or just additive.
    });

    getPresence((data: PlayerInfo, peerId: any) => {
        setPeers(prev => {
            const exists = prev.find(p => p.id === data.id);
            if (exists) return prev;
            return [...prev, data];
        });
    });

    getStart((data: { word: string, category: string }) => {
        setGameStarted(data);
    });

    getGuess((word: string) => {
        // Receive a guess from a peer
        setLatestRemoteGuess({ word, id: Date.now() + Math.random() });
    });

    // Initial Broadcast and Periodic Heartbeat
    sendPresence(me);
    const interval = setInterval(() => {
        if (roomRef.current) {
             sendPresence(me);
        }
    }, 3000);

    return () => {
        clearInterval(interval);
        if (roomRef.current) {
            roomRef.current.leave();
        }
    };
  };

  const startGame = (word: string, category: string) => {
      if (actionsRef.current) {
          actionsRef.current.sendStart({ word, category });
          setGameStarted({ word, category });
      }
  };

  const broadcastGuess = (word: string) => {
      if (actionsRef.current) {
          actionsRef.current.sendGuess(word);
      }
  };

  return {
    peers,
    connect,
    startGame,
    broadcastGuess,
    gameStarted,
    latestRemoteGuess,
    myInfo
  };
};
