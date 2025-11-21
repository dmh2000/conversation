import { useEffect, useState, useRef } from 'react';
import type { Message } from '../types';

export const useWebSocket = (url: string) => {
    const [message, setMessage] = useState<Message | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        ws.current.onmessage = (event) => {
            try {
                const data: Message = JSON.parse(event.data);
                console.log('Received message:', data);
                setMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        return () => {
            ws.current?.close();
        };
    }, [url]);

    return { message, isConnected };
};
