import React, { useState } from 'react';

export function GameSidebar({
  gameId,
  gameState,
  isConnected,
  error,
  onCreateGame,
  onJoinGame,
  onResignGame,
}) {
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinInput.trim()) {
      onJoinGame(joinInput.trim());
    }
  };

  const handleCopyId = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="sidebar">
      {/* Session Card */}
      <div className="card">
        <div className="card-header">
          <h3>Match Session</h3>
          <span className={`connection-pill ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Offline'}
          </span>
        </div>

        <button className="btn btn-primary" onClick={onCreateGame}>
          + Create New Game
        </button>

        <form onSubmit={handleJoinSubmit} className="join-form">
          <input
            type="text"
            placeholder="Enter Game ID..."
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Join
          </button>
        </form>

        {gameId && (
          <div className="game-id-badge">
            <span>ID: <code>{gameId}</code></span>
            <button className="copy-btn" onClick={handleCopyId}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="card error-card">{error}</div>}

      {/* Game State Card */}
      {gameState && (
        <div className="card">
          <div className="card-header">
            <h3>Game Status</h3>
            <span className={`status-tag ${gameState.state.toLowerCase()}`}>
              {gameState.state}
            </span>
          </div>

          <div className="status-row">
            <span>Turn:</span>
            <strong className="turn-label">{gameState.turn}</strong>
          </div>

          {gameState.check && (
            <div className="alert-badge check">
              ⚠️ CHECK on {gameState.turn}!
            </div>
          )}

          {gameState.winner && (
            <div className="alert-badge winner">
              🏆 Winner: {gameState.winner}
            </div>
          )}

          <div className="card-section">
            <h4>Move History (PGN)</h4>
            <div className="pgn-container">
              {gameState.pgn ? gameState.pgn : <em>No moves played yet.</em>}
            </div>
          </div>

          {gameState.state === 'PLAYING' && (
            <button className="btn btn-danger" onClick={onResignGame}>
              Resign Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}
