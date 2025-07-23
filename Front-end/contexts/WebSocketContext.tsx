import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/config/config';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribeToEvent: (event: string, callback: (data: any) => void) => () => void;
  unsubscribeFromEvent: (event: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  isConnecting: false,
  reconnectAttempts: 0,
  connect: () => {},
  disconnect: () => {},
  reconnect: () => {},
  subscribeToEvent: () => () => {},
  unsubscribeFromEvent: () => {},
});

interface EventSubscription {
  event: string;
  callback: (data: any) => void;
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const eventSubscriptionsRef = useRef<EventSubscription[]>([]);
  const connectRef = useRef<(() => void) | null>(null);
  const isConnectingRef = useRef(false);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000;

  const connect = useCallback(() => {
    if (socketRef.current?.connected || isConnectingRef.current) {
      return;
    }

    console.log('🔌 Tentando conectar ao WebSocket:', API_URL);
    setIsConnecting(true);
    isConnectingRef.current = true;

    try {
      socketRef.current = io(API_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: false, // Desabilitar reconexão automática do Socket.IO para controlar manualmente
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Conectado ao WebSocket com sucesso!');
        setIsConnected(true);
        setIsConnecting(false);
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0; // Resetar tentativas de reconexão
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Erro ao conectar ao WebSocket:', error);
        setIsConnected(false);
        setIsConnecting(false);
        isConnectingRef.current = false;
        
        // Tentar reconectar automaticamente
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('🔌 Desconectado do WebSocket:', reason);
        setIsConnected(false);
        
        // Tentar reconectar automaticamente se não foi uma desconexão manual
        if (reason !== 'io client disconnect' && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      });

      // Configurar listeners específicos para eventos conhecidos
      socketRef.current.on('roteiro-pronto', (data: any) => {
        console.log('🔔 Evento roteiro-pronto recebido:', data);
        eventSubscriptionsRef.current
          .filter(sub => sub.event === 'roteiro-pronto')
          .forEach(sub => {
            try {
              sub.callback(data);
            } catch (error) {
              console.error('Erro ao executar callback para evento roteiro-pronto:', error);
            }
          });
      });

      // Adicionar outros eventos conforme necessário
      socketRef.current.on('status-update', (data: any) => {
        console.log('🔔 Evento status-update recebido:', data);
        eventSubscriptionsRef.current
          .filter(sub => sub.event === 'status-update')
          .forEach(sub => {
            try {
              sub.callback(data);
            } catch (error) {
              console.error('Erro ao executar callback para evento status-update:', error);
            }
          });
      });

    } catch (error) {
      console.error('❌ Erro ao criar conexão WebSocket:', error);
      setIsConnecting(false);
      isConnectingRef.current = false;
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        scheduleReconnect();
      }
    }
  }, []);

  // Atualizar a ref com a função connect atual
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1); // Retry exponencial
    
    console.log(`🔄 Tentativa de reconexão ${reconnectAttemptsRef.current}/${maxReconnectAttempts} em ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (connectRef.current) {
        connectRef.current();
      }
    }, delay);
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 Desconectando WebSocket manualmente');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    isConnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 Reconectando WebSocket manualmente');
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  const subscribeToEvent = useCallback((event: string, callback: (data: any) => void) => {
    console.log(`📝 Inscrevendo para evento: ${event}`);
    const subscription: EventSubscription = { event, callback };
    eventSubscriptionsRef.current.push(subscription);
    
    // Retornar função para cancelar inscrição
    return () => {
      unsubscribeFromEvent(event, callback);
    };
  }, []);

  const unsubscribeFromEvent = useCallback((event: string, callback: (data: any) => void) => {
    console.log(`📝 Cancelando inscrição para evento: ${event}`);
    eventSubscriptionsRef.current = eventSubscriptionsRef.current.filter(
      sub => !(sub.event === event && sub.callback === callback)
    );
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      isConnecting,
      reconnectAttempts: reconnectAttemptsRef.current,
      connect,
      disconnect,
      reconnect,
      subscribeToEvent,
      unsubscribeFromEvent,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket deve ser usado dentro de um WebSocketProvider');
  }
  return context;
}

// Hook específico para eventos de roteiro
export function useRoteiroEvents() {
  const { subscribeToEvent, unsubscribeFromEvent } = useWebSocket();
  
  const subscribeToRoteiroPronto = useCallback((callback: (data: any) => void) => {
    return subscribeToEvent('roteiro-pronto', callback);
  }, [subscribeToEvent]);

  return {
    subscribeToRoteiroPronto,
  };
} 