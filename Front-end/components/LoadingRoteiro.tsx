import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

export default function LoadingRoteiro() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/loading-mascote.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.text}>Aguarde enquanto geramos o seu roteiro</Text>
      <ActivityIndicator size="large" color="#1677FF" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  image: {
    width: 180, height: 180, marginBottom: 24
  },
  text: {
    fontSize: 20, color: '#1677FF', fontWeight: 'bold', textAlign: 'center'
  }
}); 