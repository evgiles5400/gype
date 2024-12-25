import React from 'react';
import styles from './Dice.module.css';

type DiceProps = {
    value: string; // Symbol or text to display on the dice
    color: string; // Background color of the dice
};

const Dice: React.FC<DiceProps> = ({ value, color }) => {
    return (
        <div
            className={styles.dice}
            style={{ backgroundColor: color, color: '#fff' }} // Apply color dynamically
        >
            {value}
        </div>
    );
};

export default Dice;
