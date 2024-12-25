import React, { useState } from 'react';
import styles from './PlayerTray.module.css';
import Dice from './Dice';

type PlayerTrayProps = {
    tray: string[];
    playerName: string;
    color: string;
    onSelectPiece: (piece: string | null) => void; // Callback to pass selected piece
};

const PlayerTray: React.FC<PlayerTrayProps> = ({ tray, playerName, color, onSelectPiece }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleSelect = (index: number) => {
        if (selectedIndex === index) {
            setSelectedIndex(null); // Deselect if already selected
            onSelectPiece(null);
        } else {
            setSelectedIndex(index); // Select new piece
            onSelectPiece(tray[index]);
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
                        onClick={() => handleSelect(index)}
                    >
                        <Dice value={piece} color={color} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerTray;
