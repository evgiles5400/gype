import React from 'react';

type ControlsProps = {
    onRoll: () => void;
    onEndTurn: () => void;
};

const Controls: React.FC<ControlsProps> = ({ onRoll, onEndTurn }) => {
    return (
        <div className="controls">
            <button onClick={onRoll}>Roll Dice</button>
            <button onClick={onEndTurn}>End Turn</button>
        </div>
    );
};

export default Controls;
