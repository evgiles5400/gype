import React from 'react';
import styles from './Sidebar.module.css';

type SidebarProps = {
    log: string[]; // Array of log messages
};

const Sidebar: React.FC<SidebarProps> = ({ log }) => {
    return (
        <div className={styles.sidebar}>
            <h3>Turn Log</h3>
            <ul className={styles.log}>
                {log.map((entry, index) => (
                    <li key={index}>{entry}</li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
