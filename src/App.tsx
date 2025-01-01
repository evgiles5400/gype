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
    const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
    const [gamePhase, setGamePhase] = useState<'arranging' | 'gameplay'>('arranging');


    const mockBoard: Array<Array<string | null>> = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

    const [board, setBoard] = useState(mockBoard);

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
        const newPlayers: Player[] = Array.from({ length: num }, (_, index) => ({
            name: `Player ${index + 1}`,
            tray: [...defaultTray],
            color: colors[index],
        }));
        setPlayers(newPlayers);
    };

    const handleRearrange = (newTray: string[]) => {
        setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
                index === currentPlayerIndex
                    ? { ...player, tray: newTray }
                    : player
            )
        );
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
        if (gamePhase === 'arranging') {
            if (currentPlayerIndex === players.length - 1) {
                setGamePhase('gameplay');
                setCurrentPlayerIndex(0); // Reset to the first player
                setLog((prev) => [...prev, 'All players have arranged their trays. Gameplay begins!']);
            } else {
                setCurrentPlayerIndex((prevIndex) => prevIndex + 1);
                setLog((prev) => [...prev, `${players[currentPlayerIndex].name} finished arranging their tray.`]);
            }
        } else {
            setLog((prev) => [...prev, `${players[currentPlayerIndex].name} finished their turn.`]);
            setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length); // Cycle to the next player
        }
    };
    

    const handlePlacePiece = (row: number, col: number) => {
        if (selectedPiece === null) {
            setLog((prev) => [...prev, 'No piece selected!']);
            return;
        }

        if (board[row][col] !== null) {
            setLog((prev) => [...prev, 'Cell is occupied!']);
            return;
        }

        const updatedBoard = board.map((row) => row.slice());
        updatedBoard[row][col] = selectedPiece;
        setBoard(updatedBoard);

        // Remove piece from the player's tray
        setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
                index === currentPlayerIndex
                    ? { ...player, tray: player.tray.filter((_, i) => i !== player.tray.indexOf(selectedPiece)) }
                    : player
            )
        );

        setLog((prev) => [...prev, `${players[currentPlayerIndex].name} placed ${selectedPiece} at (${row}, ${col}).`]);
        setSelectedPiece(null); // Clear selection after placing
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

    const getBoardRotationClass = () => {
        switch (currentPlayerIndex) {
            case 1:
                return 'rotate-90';
            case 2:
                return 'rotate-180';
            case 3:
                return 'rotate-270';
            default:
                return 'rotate-0';
        }
    };

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '300px auto',
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

            {gamePhase === 'arranging' ? (
                <p style={{ textAlign: 'center', margin: '10px' }}>
                    {players[currentPlayerIndex]?.name}, arrange your tray and click "End Turn" when ready.
                </p>
            ) : (
                <p style={{ textAlign: 'center', margin: '10px' }}>
                    {players[currentPlayerIndex]?.name}, select a piece and make your move.
                </p>
            )}


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
                    onPlacePiece={handlePlacePiece}
                    rotationClass={getBoardRotationClass()} // Pass the rotation class
                />            </div>

            {/* PlayerTray */}
            <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>
            <PlayerTray
                tray={players[currentPlayerIndex]?.tray || []}
                playerName={players[currentPlayerIndex]?.name || ''}
                color={players[currentPlayerIndex]?.color || ''}
                onSelectPiece={(piece) => setSelectedPiece(piece)}
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
