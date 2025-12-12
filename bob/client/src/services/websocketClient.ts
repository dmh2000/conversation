import { useEffect, useRef, useState, useCallback } from 'react';

export interface Message {
  type?: string;
  text?: string;
}

const WS_URL = 'ws://localhost:8004';

export const MESSAGE_TYPE_RESET = 'reset';
export const MESSAGE_TYPE_RESET_ACK = 'reset_ack';

export function useWebSocket(onMessage: (message: Message) => void, onResetAck?: () => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);
  const onMessageRef = useRef(onMessage);
  const onResetAckRef = useRef(onResetAck);
  const connectRef = useRef<() => void>(() => { });

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onResetAckRef.current = onResetAck;
  }, [onResetAck]);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as Message;
            console.log('Received message:', message);

            // Handle reset acknowledgment
            if (message.type === MESSAGE_TYPE_RESET_ACK) {
              console.log('Reset acknowledged by server');
              if (onResetAckRef.current) {
                onResetAckRef.current();
              }
              return;
            }

            onMessageRef.current(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          wsRef.current = null;

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectRef.current();
          }, 8003);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    };
    connectRef.current = connect;

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.onmessage = null;
        wsRef.current.onopen = null;
        wsRef.current.close();
      }
    };
  }, []);

  const send = useCallback((data: Message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const sendReset = useCallback(() => {
    send({ type: MESSAGE_TYPE_RESET });
  }, [send]);

  return { isConnected, send, sendReset };
}
