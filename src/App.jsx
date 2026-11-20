import React, { useEffect } from 'react';
import { useChessGame } from './hooks/useChessGame';
import { ChessBoard } from './components/ChessBoard';
import { GameSidebar } from './components/GameSidebar';
import './App.css';

export default function App() {
  const {
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
  } = useChessGame();

  // Attempt to initialize a game on mount
  useEffect(() => {
    createGame();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>React Chess</h1>
          <p>Spring Boot 3 REST &amp; WebSocket Client</p>
        </div>
      </header>

      {error && !gameState && (
        <div className="backend-banner">
          <div className="banner-content">
            <span>⚠️ <strong>Backend Not Reachable:</strong> {error}</span>
            <button className="btn btn-secondary" onClick={createGame}>
              Retry Connection
            </button>
          </div>
        </div>
      )}

      <main className="main-content">
        <div className="game-layout">
          <ChessBoard
            gameState={gameState}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            onSquareClick={handleSquareClick}
          />

          <GameSidebar
            gameId={gameId}
            gameState={gameState}
            isConnected={isConnected}
            error={error}
            onCreateGame={createGame}
            onJoinGame={joinGame}
            onResignGame={resignGame}
          />
        </div>
      </main>
    </div>
  );
}
