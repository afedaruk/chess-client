import React from 'react';

export function ChessBoard({ gameState, selectedSquare, validMoves, onSquareClick }) {
  if (!gameState) {
    return (
      <div className="board-placeholder">
        <p>No active game. Click <strong>"+ New Game"</strong> or join an existing game ID to begin.</p>
      </div>
    );
  }

  const squares = [];
  // Render ranks from 8 (y=7) down to 1 (y=0)
  for (let y = 7; y >= 0; y--) {
    for (let x = 0; x < 8; x++) {
      const coord = `${String.fromCharCode(97 + x)}${y + 1}`;
      const isDark = (x + y) % 2 === 0;
      const piece = gameState.board?.[x]?.[y];

      const isSelected = selectedSquare === coord;
      const isValidMove = validMoves.includes(coord);
      const isLastMove =
        gameState.lastMovedFrom === coord || gameState.lastMovedTo === coord;

      squares.push(
        <div
          key={coord}
          data-coord={coord}
          onClick={() => onSquareClick(coord, piece)}
          className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''} ${
            isLastMove ? 'last-move' : ''
          }`}
        >
          {isValidMove && (
            <div className={piece ? 'indicator-capture' : 'indicator-move'} />
          )}

          {piece && (
            <span className={`piece-symbol ${piece.color.toLowerCase()}`}>
              {piece.symbol}
            </span>
          )}

          {/* Coordinate labels on border squares */}
          {x === 0 && <span className="label-rank">{y + 1}</span>}
          {y === 0 && (
            <span className="label-file">
              {String.fromCharCode(97 + x)}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="chessboard-wrapper">
      <div className="chessboard">{squares}</div>
    </div>
  );
}
