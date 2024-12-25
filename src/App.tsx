import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import PlayerTray from './components/PlayerTray';
import Sidebar from './components/Sidebar';

type Player = {
    name: string;
    tray: string[];
    color: string;
};

const App: React.FC = () => {
    const [numPlayers, setNumPlayers] = useState<number | null>(null); // Select number of players
    const [players, setPlayers] = useState<Player[]>([]); // Players array
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [log, setLog] = useState(['Game started!']);

    const mockBoard: Array<Array<string | null>> = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

    const [board, setBoard] = useState(mockBoard);

    const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

    const handlePlacePiece = (row: number, col: number) => {
        if (selectedPiece === null) {
            setLog((prev) => [...prev, 'No piece selected!']);
            return;
        }

        const updatedBoard = board.map((row) => row.slice());
        updatedBoard[row][col] = selectedPiece;
        setBoard(updatedBoard);

        // Remove piece from player's tray
        setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
                index === currentPlayerIndex
                    ? { ...player, tray: player.tray.filter((p) => p !== selectedPiece) }
                    : player
            )
        );

        setLog((prev) => [...prev, `Placed ${selectedPiece} at [${row}, ${col}]`]);
        setSelectedPiece(null); // Clear selection
    };


    return (
        <div>
            {/* GameBoard */}
            <GameBoard board={board} onPlacePiece={handlePlacePiece} />

            {/* PlayerTray */}
            <PlayerTray
                tray={players[currentPlayerIndex]?.tray || []}
                playerName={players[currentPlayerIndex]?.name || ''}
                color={players[currentPlayerIndex]?.color || ''}
                onSelectPiece={(piece) => setSelectedPiece(piece)}
            />
        </div>
    );
    
    // Handle tray rearrangement
    const handleRearrange = (newTray: string[]) => {
        setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
                index === currentPlayerIndex
                    ? { ...player, tray: newTray }
                    : player
            )
        );
    };

    // Tray validation function
    const validateTray = (tray: string[]) => {
        const requiredPieces: Record<'Sword' | 'Tree' | 'Book' | 'Flame', number> = {
            Sword: 2,
            Tree: 2,
            Book: 2,
            Flame: 2,
        };

        const pieceCounts = tray.reduce((counts, piece) => {
            if (piece in requiredPieces) {
                counts[piece as 'Sword' | 'Tree' | 'Book' | 'Flame'] =
                    (counts[piece as 'Sword' | 'Tree' | 'Book' | 'Flame'] || 0) + 1;
            }
            return counts;
        }, {} as Record<'Sword' | 'Tree' | 'Book' | 'Flame', number>);

        return (Object.keys(requiredPieces) as Array<'Sword' | 'Tree' | 'Book' | 'Flame'>).every(
            (piece) => pieceCounts[piece] === requiredPieces[piece]
        );
    };

    const initializePlayers = (num: number) => {
        const defaultTray = ['Sword', 'Sword', 'Tree', 'Tree', 'Book', 'Book', 'Flame', 'Flame'];
        const colors = ['red', 'blue', 'green', 'orange'];
        const newPlayers = Array.from({ length: num }, (_, index) => ({
            name: `Player ${index + 1}`,
            tray: [...defaultTray],
            color: colors[index],
        }));
        setPlayers(newPlayers);
    };

    const handleStartGame = () => {
        const currentPlayerTray = players[currentPlayerIndex].tray;

        if (!validateTray(currentPlayerTray)) {
            setLog((prev) => [
                ...prev,
                `Invalid tray configuration for ${players[currentPlayerIndex].name}.`,
            ]);
            return;
        }

        setLog((prev) => [...prev, 'Game started!']);
    };

    const handleEndTurn = () => {
        setLog((prev) => [
            ...prev,
            `${players[currentPlayerIndex].name} finished their turn.`,
        ]);
        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length); // Cycle to the next player
    };

    if (numPlayers === null) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    gap: '20px',
                }}
            >
                <h1>Select Number of Players</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[2, 3, 4].map((num) => (
                        <button
                            key={num}
                            onClick={() => {
                                setNumPlayers(num);
                                initializePlayers(num);
                            }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4a2f1b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            {num} Players
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '275px 1fr',
                gridTemplateRows: '1fr auto',
                height: '100vh',
                gap: '10px',
                padding: '10px',
                boxSizing: 'border-box',
            }}
        >
            {/* Sidebar */}
            <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3' }}>
                <Sidebar log={log} />
            </div>

            {/* GameBoard */}
            <div
                style={{
                    gridColumn: '2 / 3',
                    gridRow: '1 / 2',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <GameBoard
                    board={board}
                    onMove={(from, to) => {
                        const [fromRow, fromCol] = from;
                        const [toRow, toCol] = to;

                        if (board[toRow][toCol] !== null) {
                            setLog((prev) => [...prev, `Invalid move. Destination is occupied.`]);
                            return;
                        }

                        const updatedBoard = board.map((row) => row.slice());
                        updatedBoard[toRow][toCol] = updatedBoard[fromRow][fromCol];
                        updatedBoard[fromRow][fromCol] = null;

                        setBoard(updatedBoard);
                        setLog((prev) => [...prev, `Moved from ${from} to ${to}`]);
                    }}
                />
            </div>

            {/* PlayerTray */}
            <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>
                <PlayerTray
                    tray={players[currentPlayerIndex]?.tray || []}
                    playerName={players[currentPlayerIndex]?.name || ''}
                    color={players[currentPlayerIndex]?.color || ''}
                    onRearrange={handleRearrange}
                />
                <button
                    onClick={handleStartGame}
                    style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#8b5e34',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Start Game
                </button>
                <button
                    onClick={handleEndTurn}
                    style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        backgroundColor: '#4a2f1b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    End Turn
                </button>
            </div>
        </div>
    );
};

export default App;
