import React from 'react';
import styles from './GameBoard.module.css';

type GameBoardProps = {
    board: Array<Array<string | null>>; // 2D array representing the board state
    onMove: (from: [number, number], to: [number, number]) => void;
};

const GameBoard: React.FC<GameBoardProps> = ({ board, onMove }) => {
    const getCellClass = (row: number, col: number) => {
        return (row + col) % 2 === 0 ? styles['light-cell'] : styles['dark-cell'];
    };

    return (
        <div className={styles['game-board']}>
            {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`${styles['board-cell']} ${getCellClass(rowIndex, colIndex)}`}
                        onClick={() => onMove([rowIndex, colIndex], [rowIndex, colIndex])}
                    >
                        {cell && <span>{cell}</span>}
                    </div>
                ))
            )}
        </div>
    );
};


export default GameBoard;
