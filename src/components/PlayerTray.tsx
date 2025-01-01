import React, { useState } from 'react';
import styles from './PlayerTray.module.css';
import Dice from './Dice';

type PlayerTrayProps = {
    tray: string[];
    playerName: string;
    color: string;
    onSelectPiece: (piece: string | null) => void;
    onRearrange?: (newTray: string[]) => void;
};

const PlayerTray: React.FC<PlayerTrayProps> = ({ tray, playerName, color, onSelectPiece, onRearrange }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Add state for selected piece

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
        setSelectedIndex(index); // Clear selection when starting a drag
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (onRearrange) {
            const newTray = [...tray];
            const draggedItem = newTray.splice(selectedIndex!, 1)[0];
            newTray.splice(index, 0, draggedItem);
            onRearrange(newTray);
        }
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
