import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { API_URL, GOOGLE_PLACES_API_KEY } from '../config/config';
import PreferencesModal from '../components/PreferencesModal';
import { GoogleAutocomplete } from '../components/GoogleAutocomplete';
import { useRoteiroNotification } from '../contexts/RoteiroNotificationContext';
import { useRoteiroEvents } from '../contexts/WebSocketContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingRoteiro from '../components/LoadingRoteiro';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Place {
  id: string;
  name: string;
  address: string;
  price?: string;
  image: string;
  type?: string;
}

interface Preferences {
  period: string[];
  types: string[];
  budget: string[];
  company: string[];
  descricao?: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    period: [],
    types: [],
    budget: [],
    company: [],
  });
  const [startLocation, setStartLocation] = useState<{ lat: number, lng: number, name: string } | null>(null);
  const [startInput, setStartInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const { setHasNotification } = useRoteiroNotification();
  const { subscribeToRoteiroPronto } = useRoteiroEvents();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (!search) fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
      }
    })();
  }, []);

  // Escutar eventos de roteiro pronto via WebSocket centralizado
  useEffect(() => {
    const unsubscribe = subscribeToRoteiroPronto((data) => {
      console.log('🔔 Roteiro pronto recebido na página de busca:', data);
      setProcessing(false);
      Alert.alert(
        "Roteiro Pronto!",
        "Seu roteiro inteligente foi criado com sucesso!",
        [
          { 
            text: "Ver", 
            onPress: () => {
              // Navega para a tela de roteiros passando o roteiro para expandir
              router.push({
                pathname: '/(tabs)/roteiro',
                params: { roteiroParaExpandir: JSON.stringify(data.roteiro) }
              });
            }
          },
          { 
            text: "Sair", 
            style: "destructive",
            onPress: () => {
              // Apenas esconde o alerta, mantém o badge ativo
              console.log('Usuário escolheu sair, badge permanece ativo');
            }
          }
        ]
      );
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToRoteiroPronto, router]);

  async function fetchNearbyPlaces(lat: number, lng: number) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=tourist_attraction|restaurant|museum|park|bar|night_club|cafe&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`
      );
      const data = await res.json();
      const results = await Promise.all(
        (data.results || []).map(async (item: any) => {
          let image = 'https://via.placeholder.com/160x90?text=No+Image';
          if (item.photos && item.photos.length > 0) {
            image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
          }
          let type = 'Ponto de Interesse';
          if (item.types && item.types.length > 0) {
            if (item.types.includes('tourist_attraction')) type = 'Atração';
            else if (item.types.includes('restaurant')) type = 'Restaurante';
            else if (item.types.includes('museum')) type = 'Museu';
            else if (item.types.includes('park')) type = 'Parque';
            else if (item.types.includes('bar')) type = 'Bar';
            else if (item.types.includes('night_club')) type = 'Casa Noturna';
            else if (item.types.includes('cafe')) type = 'Café';
            else type = 'Ponto de Interesse';
          }
          return {
            id: item.place_id,
            name: item.name,
            address: item.vicinity || item.formatted_address || '',
            price: item.price_level ? `R$${item.price_level * 100},00` : '',
            image,
            type,
          };
        })
      );
      
      // Filtrar apenas locais relevantes para turismo
      const filteredResults = results.filter(place => {
        const relevantTypes = ['Atração', 'Restaurante', 'Museu', 'Parque', 'Bar', 'Casa Noturna', 'Café'];
        return relevantTypes.includes(place.type);
      });
      
      setPlaces(filteredResults);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível buscar locais próximos.');
    }
    setLoading(false);
  }

  async function fetchPlacesByText(text: string) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(text)}&type=tourist_attraction|restaurant|museum|park|bar|night_club|cafe&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`
      );
      const data = await res.json();
      const results = await Promise.all(
        (data.results || []).map(async (item: any) => {
          let image = 'https://via.placeholder.com/160x90?text=No+Image';
          if (item.photos && item.photos.length > 0) {
            image = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
          }
          
          // Determinar o tipo do local
          let type = 'Ponto de Interesse';
          if (item.types && item.types.length > 0) {
            if (item.types.includes('tourist_attraction')) type = 'Atração';
            else if (item.types.includes('restaurant')) type = 'Restaurante';
            else if (item.types.includes('museum')) type = 'Museu';
            else if (item.types.includes('park')) type = 'Parque';
            else if (item.types.includes('bar')) type = 'Bar';
            else if (item.types.includes('night_club')) type = 'Casa Noturna';
            else if (item.types.includes('cafe')) type = 'Café';
            else type = 'Ponto de Interesse';
          }
          
          return {
            id: item.place_id,
            name: item.name,
            address: item.formatted_address || item.vicinity || '',
            price: item.price_level ? `R$${item.price_level * 100},00` : '',
            image,
            type,
          };
        })
      );
      
      // Filtrar apenas locais relevantes para turismo
      const filteredResults = results.filter(place => {
        const relevantTypes = ['Atração', 'Restaurante', 'Museu', 'Parque', 'Bar', 'Casa Noturna', 'Café'];
        return relevantTypes.includes(place.type);
      });
      
      setPlaces(filteredResults);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível buscar locais.');
    }
    setLoading(false);
  }

  function handleSearch(text: string) {
    setSearch(text);
    if (text.length > 1) {
      fetchPlacesByText(text);
    } else if (userLocation) {
      fetchNearbyPlaces(userLocation.latitude, userLocation.longitude);
    } else {
      setPlaces([]);
    }
  }

  async function usarMinhaLocalizacao() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      // Chamada à API de geocodificação reversa do Google
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`
      );
      const data = await res.json();
      let cityName = 'Minha localização';
      if (data.results && data.results.length > 0) {
        // Procura pelo componente de cidade
        const cityComponent = data.results[0].address_components.find((c: any) =>
          c.types.includes('locality')
        );
        if (cityComponent) {
          cityName = cityComponent.long_name;
        } else {
          // Fallback: usa o endereço formatado
          cityName = data.results[0].formatted_address;
        }
      }
      setStartLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        name: cityName,
      });
      setStartInput(cityName);
      // Buscar locais próximos dessa cidade
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
    }
  }

  function onSelectPlace(details: any) {
    if (details && details.geometry && details.geometry.location) {
      setStartLocation({
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
        name: details.name,
      });
      setStartInput(details.name);
    }
  }

  async function gerarRoteiro() {
    console.log('Cliquei no botão!');
    if (!startLocation) {
      Alert.alert('Selecione o local de partida');
      return;
    }
    const payload = {
      place: startLocation, // { lat, lng, name }
      preferences,
      extraPlaces: [], // pode adicionar locais extras se quiser
    };
    console.log('Payload:', payload);
    console.log('URL:', `${API_URL}/places/select`);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/places/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Resposta:', res.status, data);
      if (data.status === 'processing') {
        setProcessing(true);
        setLoading(false);
        return;
      } else if (data.roteiro) {
        // Exibir roteiro imediatamente
      }
    } catch (e) {
      console.error('Erro ao gerar roteiro:', e);
      Alert.alert('Erro ao gerar roteiro');
    }
    setLoading(false);
  }

  if (processing) {
    return <LoadingRoteiro />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pesquisar</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de busca para local de partida + botão localização + preferências */}
      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <View style={styles.startLocationRow}>
          <View style={{ flex: 1, maxWidth: '70%' }}>
            <GoogleAutocomplete
              placeholder="Onde você está?"
              onPlaceSelect={onSelectPlace}
            />
          </View>
          <TouchableOpacity style={styles.locationButton} onPress={usarMinhaLocalizacao}>
            <Ionicons name="locate" size={22} color="#1677ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.prefsButton} onPress={() => setShowPrefs(true)}>
            <Ionicons name="options-outline" size={20} color="#1677ff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Botão de gerar roteiro */}
      <TouchableOpacity style={styles.gerarButton} onPress={gerarRoteiro}>
        <Text style={styles.gerarButtonText}>Gerar Roteiro Inteligente</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.sectionTitle}>Locais Próximos</Text>

      {/* Lista horizontal de cards */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} size="large" color="#1677ff" />
      ) : (
        <FlatList
          data={
            search.trim() === ''
              ? places.filter(item => ['Atração', 'Restaurante', 'Museu', 'Parque', 'Bar', 'Casa Noturna', 'Café'].includes(item.type || ''))
              : places
          }
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.typeBadge, getTypeBadgeStyle(item.type)]}>
                <MaterialIcons name={getTypeIcon(item.type)} size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.typeBadgeText}>{item.type}</Text>
              </View>
              <Text style={styles.cardAddress} numberOfLines={2}>{item.address}</Text>
              {item.price ? <Text style={styles.cardPrice}>{item.price}</Text> : null}
            </View>
          )}
        />
      )}

      {/* Modal de Preferências */}
      <PreferencesModal
        visible={showPrefs}
        onClose={() => setShowPrefs(false)}
        preferences={preferences}
        setPreferences={setPreferences}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 0,
    marginBottom: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  cancelText: { fontSize: 16, color: '#1677ff' },
  startLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prefsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gerarButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#1677ff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  gerarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
    color: '#222',
  },
  card: {
    width: 160,
    height: 170,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    padding: 12,
    shadowColor: '#0002',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  cardImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  cardAddress: { fontSize: 13, color: '#888', marginBottom: 4 },
  cardPrice: { fontSize: 14, color: '#1677ff', fontWeight: 'bold' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
    marginTop: 2,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

function getTypeIcon(type?: string) {
  switch (type) {
    case 'Atração': return 'star';
    case 'Restaurante': return 'restaurant';
    case 'Museu': return 'museum';
    case 'Parque': return 'park';
    case 'Bar': return 'local-bar';
    case 'Casa Noturna': return 'nightlife';
    case 'Café': return 'local-cafe';
    default: return 'place';
  }
}

function getTypeBadgeStyle(type?: string) {
  switch (type) {
    case 'Atração': return { backgroundColor: '#1677ff' };
    case 'Restaurante': return { backgroundColor: '#FF9800' };
    case 'Museu': return { backgroundColor: '#607D8B' };
    case 'Parque': return { backgroundColor: '#43A047' };
    case 'Bar': return { backgroundColor: '#E91E63' };
    case 'Casa Noturna': return { backgroundColor: '#9C27B0' };
    case 'Café': return { backgroundColor: '#795548' };
    default: return { backgroundColor: '#888' };
  }
} 