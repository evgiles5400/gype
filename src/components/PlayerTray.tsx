import React, { useState } from 'react';
import styles from './PlayerTray.module.css';
import Dice from './Dice';

type PlayerTrayProps = {
    tray: string[];
    playerName: string;
    color: string;
    onSelectPiece: (piece: string | null) => void;
    onRearrange?: (newTray: string[]) => void; // Optional callback for rearrangement
};

const PlayerTray: React.FC<PlayerTrayProps> = ({ tray, playerName, color, onSelectPiece, onRearrange }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // Add draggedIndex state
    let lastDraggedIndex: number | null = null; // Local variable to reduce redundant updates

    const handleSelect = (index: number) => {
        if (selectedIndex === index) {
            setSelectedIndex(null); // Deselect if already selected
            onSelectPiece(null);
        } else {
            setSelectedIndex(index); // Select new piece
            onSelectPiece(tray[index]);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index); // Set the dragged index
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index || lastDraggedIndex === index) return;

        const newTray = [...tray];
        const [draggedItem] = newTray.splice(draggedIndex, 1);
        newTray.splice(index, 0, draggedItem);

        if (onRearrange) {
            onRearrange(newTray); // Notify the parent of the new tray order
        }

        setDraggedIndex(index); // Update the dragged index
        lastDraggedIndex = index; // Avoid redundant updates
    };

    return (
        <div className={styles['player-tray']}>
            <div className={styles['player-name']} style={{ backgroundColor: color }}>
                {playerName}'s Tray
            </div>
            <div className={styles.tray}>
                {tray.map((piece, index) => (
                    <div
                        key={index}
                        className={`${styles['tray-piece']} ${
                            selectedIndex === index ? styles['selected'] : ''
                        }`}
                        draggable
                        onClick={() => handleSelect(index)}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                    >
                        <Dice value={piece} color={color} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerTray;
