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

/*
    const mockBoard: Array<Array<string | null>> = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
*/
    const [board, setBoard] = useState<string[][]>(Array(8).fill("").map(() => Array(8).fill("")));
    const [hasPlacedPiece, setHasPlacedPiece] = useState(false);
    const [previousState, setPreviousState] = useState<{ board: string[][]; tray: string[] } | null>(null);

/*
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
*/
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

/*    
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
*/

    const handleEndTurn = () => {
        if (gamePhase === 'arranging') {
            if (currentPlayerIndex === players.length - 1) {
                setGamePhase('gameplay'); // Transition to gameplay after the last player finishes arranging
                setCurrentPlayerIndex(0); // Reset to Player 1
                setLog((prev) => [...prev, 'All players have finished arranging their dice. Gameplay begins!']);
            } else {
                setCurrentPlayerIndex((prevIndex) => prevIndex + 1); // Move to the next player
                setLog((prev) => [...prev, `${players[currentPlayerIndex].name} finished arranging their dice.`]);
            }
        } else {
            setLog((prev) => [...prev, `${players[currentPlayerIndex].name} finished their turn.`]);
            setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length); // Cycle to the next player
            setHasPlacedPiece(false); // Reset for the next turn
        }
    };  
    

    const handlePlacePiece = (row: number, col: number) => {
        if (gamePhase !== 'gameplay') return; // Ensure placement only happens in gameplay phase
        if (!selectedPiece || hasPlacedPiece) return;
    
        // Save current state for undo
        setPreviousState({
            board: board.map((r) => r.slice()),
            tray: [...players[currentPlayerIndex].tray],
        });
    
        const updatedBoard = board.map((r) => r.slice());
        updatedBoard[row][col] = selectedPiece; // Place the die
        setBoard(updatedBoard);
    
        setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
                index === currentPlayerIndex
                    ? { ...player, tray: player.tray.filter((_, i) => i !== player.tray.indexOf(selectedPiece)) }
                    : player
            )
        );
    
        setSelectedPiece(null); // Clear the selected die
        setValidCells([]); // Clear valid placement highlights
        setHasPlacedPiece(true); // Mark the die as placed
    };    
    

    const getValidPlacementCells = (
        die: string,
        board: Array<Array<string | null>>,
        currentPlayerIndex: number
    ): Array<[number, number]> => {
        const validCells: Array<[number, number]> = [];
    
        if (currentPlayerIndex === 0) {
            // Player 1 (south to north)
            board[7].forEach((cell, colIndex) => {
                if (cell === null) validCells.push([7, colIndex]);
            });
        } else if (currentPlayerIndex === 1) {
            // Player 2 (north to south)
            board[0].forEach((cell, colIndex) => {
                if (cell === null) validCells.push([0, colIndex]);
            });
        } else if (currentPlayerIndex === 2) {
            // Player 3 (east to west)
            board.forEach((row, rowIndex) => {
                if (row[7] === null) validCells.push([rowIndex, 7]);
            });
        } else if (currentPlayerIndex === 3) {
            // Player 4 (west to east)
            board.forEach((row, rowIndex) => {
                if (row[0] === null) validCells.push([rowIndex, 0]);
            });
        }
    
        return validCells;
    };    
       

    const [validCells, setValidCells] = useState<Array<[number, number]>>([]);

    const handleSelectPiece = (piece: string | null) => {
        setSelectedPiece(piece);
        if (piece && gamePhase === 'gameplay') {
            const validMoves = getValidPlacementCells(piece, board, currentPlayerIndex);
            setValidCells(validMoves); // Highlight valid cells for the selected piece
        } else {
            setValidCells([]); // Clear highlights if no piece is selected
        }
    };    

    const handleUndo = () => {
        if (!previousState) return;
    
        setBoard(previousState.board); // Restore the previous board state
        setPlayers((prevPlayers) =>
            prevPlayers.map((player, index) =>
                index === currentPlayerIndex
                    ? { ...player, tray: previousState.tray }
                    : player
            )
        );
    
        setPreviousState(null); // Clear previous state after undo
        setHasPlacedPiece(false); // Allow the player to move again
    };
    
    const handleSelectBoardDie = (row: number, col: number) => {
        const die = board[row][col];
        if (die !== null) {
            setSelectedPiece(die);
            const validMoves = getValidMovesForDie(die, row, col, board); // Pass die to calculate moves
            setValidCells(validMoves);
        }
    };      

    const getValidMovesForDie = (
        die: string,
        row: number,
        col: number,
        board: Array<Array<string | null>>
    ): Array<[number, number]> => {
        const moves: Array<[number, number]> = [];
        const isWithinBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
    
        switch (die) {
            case 'Sword':
                // Moves forward one row
                if (isWithinBounds(row - 1, col) && board[row - 1][col] === null) {
                    moves.push([row - 1, col]);
                }
                break;
    
            case 'Tree':
                // Moves left or right one column
                if (isWithinBounds(row, col - 1) && board[row][col - 1] === null) {
                    moves.push([row, col - 1]);
                }
                if (isWithinBounds(row, col + 1) && board[row][col + 1] === null) {
                    moves.push([row, col + 1]);
                }
                break;
    
            case 'Book':
                // Moves diagonally in any direction by one cell
                if (isWithinBounds(row - 1, col - 1) && board[row - 1][col - 1] === null) {
                    moves.push([row - 1, col - 1]);
                }
                if (isWithinBounds(row - 1, col + 1) && board[row - 1][col + 1] === null) {
                    moves.push([row - 1, col + 1]);
                }
                if (isWithinBounds(row + 1, col - 1) && board[row + 1][col - 1] === null) {
                    moves.push([row + 1, col - 1]);
                }
                if (isWithinBounds(row + 1, col + 1) && board[row + 1][col + 1] === null) {
                    moves.push([row + 1, col + 1]);
                }
                break;
    
            case 'Flame':
                // Moves forward or backward by one row
                if (isWithinBounds(row - 1, col) && board[row - 1][col] === null) {
                    moves.push([row - 1, col]);
                }
                if (isWithinBounds(row + 1, col) && board[row + 1][col] === null) {
                    moves.push([row + 1, col]);
                }
                break;
    
            default:
                console.warn(`Unknown die type: ${die}`);
                break;
        }
    
        return moves;
    };

/*
    const validMoves = getValidMovesForDie(selectedPiece, row, col, board);
        setValidCells(validMoves);
*/

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

    const getBoardRotationClass = (currentPlayerIndex: number) => {
        switch (currentPlayerIndex) {
            case 0: return 'rotate-0'; // Player 1: South (no rotation)
            case 1: return 'rotate-180'; // Player 2: North
            case 2: return 'rotate-90'; // Player 3: East
            case 3: return 'rotate-270'; // Player 4: West
            default: return 'rotate-0';
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
                    validCells={validCells} // Pass valid cells to highlight
                    rotationClass={getBoardRotationClass(currentPlayerIndex)} // Pass the rotation class
                    onSelectBoardDie={handleSelectBoardDie}
                />            </div>

            {/* PlayerTray */}
            <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }}>
            <PlayerTray
                tray={players[currentPlayerIndex]?.tray || []}
                playerName={players[currentPlayerIndex]?.name || ''}
                color={players[currentPlayerIndex]?.color || ''}
                onSelectPiece={handleSelectPiece} // Pass handleSelectPiece here
                onRearrange={handleRearrange}
                gamePhase={gamePhase} // Pass the current game phase
            />

                <button
                    onClick={handleUndo}
                    disabled={!previousState || hasPlacedPiece === false}
                    style={{
                        marginTop: '10px',
                        padding: '10px 20px',
                        backgroundColor: previousState && !hasPlacedPiece ? '#4a90e2' : '#ccc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: previousState && !hasPlacedPiece ? 'pointer' : 'not-allowed',
                    }}
                >
                    Undo
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
