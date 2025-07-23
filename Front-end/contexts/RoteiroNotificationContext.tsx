import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRoteiroEvents } from './WebSocketContext';

interface RoteiroNotificationContextType {
  hasNotification: boolean;
  setHasNotification: (value: boolean) => void;
  clearNotification: () => void;
}

const RoteiroNotificationContext = createContext<RoteiroNotificationContextType>({
  hasNotification: false,
  setHasNotification: () => {},
  clearNotification: () => {},
});

export function RoteiroNotificationProvider({ children }: { children: React.ReactNode }) {
  const [hasNotification, setHasNotification] = useState(false);
  const { subscribeToRoteiroPronto } = useRoteiroEvents();

  const clearNotification = () => {
    setHasNotification(false);
  };

  useEffect(() => {
    // Inscrever para eventos de roteiro pronto
    const unsubscribe = subscribeToRoteiroPronto((data) => {
      console.log('🔔 Roteiro pronto recebido via WebSocket:', data);
      setHasNotification(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <RoteiroNotificationContext.Provider value={{ 
      hasNotification, 
      setHasNotification,
      clearNotification 
    }}>
      {children}
    </RoteiroNotificationContext.Provider>
  );
}

export function useRoteiroNotification() {
  return useContext(RoteiroNotificationContext);
} 