import React from 'react';

interface MessageDisplayProps {
    text: string;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ text }) => {
    return (
        <div className="message-display">
            <h1>Incoming Message:</h1>
            <p className="message-text">{text}</p>
        </div>
    );
};
