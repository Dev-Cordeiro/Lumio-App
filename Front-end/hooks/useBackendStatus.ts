import { useWebSocket } from '../contexts/WebSocketContext';

export function useBackendStatus() {
  const { isConnected, isConnecting, reconnectAttempts } = useWebSocket();

  return {
    isConnected,
    isConnecting,
    reconnectAttempts,
  };
} 