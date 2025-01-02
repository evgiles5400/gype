import React from 'react';
import styles from './GameBoard.module.css';

type GameBoardProps = {
    board: Array<Array<string | null>>;
    onPlacePiece: (row: number, col: number) => void; // Callback for placing a piece
    validCells: Array<[number, number]>; // Add validCells to props
    rotationClass?: string; // Add rotationClass as an optional string prop
};

const GameBoard: React.FC<GameBoardProps> = ({ board, onPlacePiece, validCells, rotationClass }) => {
    const isValidCell = (row: number, col: number) =>
        validCells.some(([validRow, validCol]) => validRow === row && validCol === col);    
    
    return (
        <div className={`${styles['game-board']} ${rotationClass ? styles[rotationClass] : ''}`}>
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`${styles['board-cell']} ${
                            cell === null ? styles['empty-cell'] : styles['occupied-cell']
                        } ${isValidCell(rowIndex, colIndex) ? styles['highlight-cell'] : ''}`}
                        onClick={() => {
                            if (isValidCell(rowIndex, colIndex)) {
                                onPlacePiece(rowIndex, colIndex);
                            }
                        }}
                    >
                        {cell && <span>{cell}</span>}
                    </div>
                ))
            )}
        </div>
    );
};

export default GameBoard;
