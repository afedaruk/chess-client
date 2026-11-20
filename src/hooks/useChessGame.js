import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export function useChessGame() {
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const stompClientRef = useRef(null);

  // 1. Create a new game
  const createGame = async () => {
    try {
      setError(null);
      const res = await fetch('/api/games', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Failed to create game (HTTP ${res.status}). Is backend running on :8080?`);
      }
      const data = await res.json();
      setGameId(data.gameId);
      setGameState(data);
      setSelectedSquare(null);
      setValidMoves([]);
    } catch (err) {
      console.error('createGame error:', err);
      setError(err.message);
    }
  };

  // 2. Join existing game by ID
  const joinGame = async (id) => {
    const trimmed = id?.trim();
    if (!trimmed) return;
    try {
      setError(null);
      const res = await fetch(`/api/games/${trimmed}`);
      if (!res.ok) {
        throw new Error(`Game '${trimmed}' not found (HTTP ${res.status}).`);
      }
      const data = await res.json();
      setGameId(trimmed);
      setGameState(data);
      setSelectedSquare(null);
      setValidMoves([]);
    } catch (err) {
      console.error('joinGame error:', err);
      setError(err.message);
    }
  };

  // 3. Resign game
  const resignGame = async () => {
    if (!gameId || !gameState) return;
    try {
      const color = gameState.turn?.toLowerCase() || 'white';
      const res = await fetch(`/api/games/${gameId}/resign?color=${color}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setGameState(data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 4. WebSocket setup via native WebSockets in @stomp/stompjs
  useEffect(() => {
    if (!gameId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const brokerURL = `${protocol}//${window.location.host}/ws`;

    const client = new Client({
      brokerURL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        setError(null);

        client.subscribe(`/topic/game/${gameId}`, (message) => {
          try {
            const updated = JSON.parse(message.body);
            setGameState(updated);
            setSelectedSquare(null);
            setValidMoves([]);
          } catch (e) {
            console.error('Failed to parse incoming game state:', e);
          }
        });

        // Request latest state
        client.publish({
          destination: `/app/game/${gameId}/join`,
          body: JSON.stringify({}),
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error:', frame.headers['message']);
        setError(frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.warn('WebSocket connection error, fallback to REST is active.', event);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      setIsConnected(false);
    };
  }, [gameId]);

  // 5. Handle Square Click
  const handleSquareClick = useCallback(async (coord, piece) => {
    if (!gameState || gameState.state !== 'PLAYING') return;

    // Legal move destination clicked
    if (selectedSquare && validMoves.includes(coord)) {
      makeMove(selectedSquare, coord);
      return;
    }

    // Piece clicked
    if (piece && piece.color === gameState.turn) {
      setSelectedSquare(coord);
      try {
        const res = await fetch(`/api/games/${gameId}/moves?square=${coord}`);
        if (res.ok) {
          const data = await res.json();
          setValidMoves(data.moves || []);
        }
      } catch (err) {
        console.error('fetch moves error:', err);
      }
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  }, [gameId, gameState, selectedSquare, validMoves]);

  // 6. Make move via STOMP or REST fallback
  const makeMove = async (from, to) => {
    setError(null);
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: `/app/game/${gameId}/move`,
        body: JSON.stringify({ from, to }),
      });
      setSelectedSquare(null);
      setValidMoves([]);
    } else {
      try {
        const res = await fetch(`/api/games/${gameId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Illegal move');
        }
        const data = await res.json();
        setGameState(data);
        setSelectedSquare(null);
        setValidMoves([]);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return {
    gameId,
    gameState,
    selectedSquare,
    validMoves,
    isConnected,
    error,
    createGame,
    joinGame,
    resignGame,
    handleSquareClick,
  };
}
