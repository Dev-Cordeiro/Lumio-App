import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWebSocket } from '@/contexts/WebSocketContext';

export function WebSocketStatus() {
  const { isConnected, isConnecting, reconnectAttempts } = useWebSocket();
  const maxReconnectAttempts = 5;

  if (isConnected) {
    return null; // Não mostrar nada quando conectado
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Ionicons 
          name={isConnecting ? "sync" : "wifi-outline"} 
          size={16} 
          color={isConnecting ? "#FF9500" : "#FF3B30"} 
          style={isConnecting ? styles.spinning : undefined}
        />
        <Text style={styles.statusText}>
          {isConnecting 
            ? "Conectando..." 
            : reconnectAttempts > 0 
              ? `Reconectando... (${reconnectAttempts}/${maxReconnectAttempts})`
              : "Desconectado"
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
}); 