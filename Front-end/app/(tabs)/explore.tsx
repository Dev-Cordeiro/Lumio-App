import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { GOOGLE_PLACES_API_KEY, API_URL } from "../../config/config";
import PreferencesModal from "../../components/PreferencesModal";
import { GoogleAutocomplete } from "../../components/GoogleAutocomplete";
import { useRoteiroNotification } from "../../contexts/RoteiroNotificationContext";
import { useRoteiroEvents } from "../../contexts/WebSocketContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, Circle } from "react-native-maps";
import { useAuth } from "@/contexts/AuthContext";

interface Place {
  id: string;
  name: string;
  address: string;
  price?: string;
  image: string;
}

interface Preferences {
  period: string[];
  types: string[];
  budget: string[];
  company: string[];
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", stylers: [{ color: "#c9c9c9" }] },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHasNotification } = useRoteiroNotification();
  const { subscribeToRoteiroPronto } = useRoteiroEvents();
  const { token } = useAuth();

  // Escutar eventos de roteiro pronto via WebSocket centralizado
  useEffect(() => {
    const unsubscribe = subscribeToRoteiroPronto((data) => {
      console.log("🔔 Roteiro pronto recebido na página explore:", data);
      setHasNotification(true);
      Alert.alert(
        "Roteiro Pronto!",
        "Seu roteiro inteligente foi criado com sucesso!",
        [
          {
            text: "Ver",
            onPress: () => {
              // Navega para a tela de roteiros passando o roteiro para expandir
              router.push({
                pathname: "/(tabs)/roteiro",
                params: { roteiroParaExpandir: JSON.stringify(data.roteiro) },
              });
            },
          },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => {
              // Apenas esconde o alerta, mantém o badge ativo
              console.log("Usuário escolheu sair, badge permanece ativo");
            },
          },
        ]
      );
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToRoteiroPronto, setHasNotification, router]);

  const [startLocation, setStartLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    period: [],
    types: [],
    budget: [],
    company: [],
  });
  const [showPrefs, setShowPrefs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  async function requestLocationAndFetch() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Não foi possível acessar sua localização."
      );
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    fetchNearbyPlaces(loc.coords.latitude, loc.coords.longitude);
  }

  async function fetchNearbyPlaces(lat: number, lng: number) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=point_of_interest&key=${GOOGLE_PLACES_API_KEY}&language=pt-BR`
      );
      const data = await res.json();
      const results: Place[] = (data.results || [])
        .slice(0, 4)
        .map((item: any) => ({
          id: item.place_id,
          name: item.name,
          address: item.vicinity || item.formatted_address || "",
          price: item.price_level
            ? `R$${item.price_level * 100}/pessoa`
            : undefined,
          image: item.photos?.length
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            : "https://via.placeholder.com/160x90?text=No+Image",
        }));
      setPlaces(results);
    } catch {
      Alert.alert("Erro", "Não foi possível buscar locais próximos.");
    } finally {
      setLoading(false);
    }
  }

  async function usarMinhaLocalizacao() {
    setShowMap(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Não foi possível acessar sua localização."
      );
      setShowMap(false);
      return;
    }
    setLoading(true);
    const loc = await Location.getCurrentPositionAsync({});
    setStartLocation({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
      name: "Minha localização",
    });
    fetchNearbyPlaces(loc.coords.latitude, loc.coords.longitude);
    setLoading(false);
  }

  async function gerarRoteiro() {
    if (!startLocation) {
      return Alert.alert("Aviso", "Selecione o local de partida.");
    }
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/places/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          startLocation, // aqui
          preferences,
          extraPlaces: [],
        }),
      });
      const data = await res.json();
      // … restante do fluxo
    } catch {
      Alert.alert("Erro", "Não foi possível gerar o roteiro.");
    } finally {
      setProcessing(false);
    }
  }

  if (processing) {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { paddingTop: insets.top + 20 }]}
      >
        <ActivityIndicator size="large" color="#1677FF" />
        <Text style={styles.loadingText}>
          Gerando seu roteiro inteligente...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Text
            style={[
              styles.headerTitle,
              {
                position: "absolute",
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 1,
              },
            ]}
          >
            Pesquisar
          </Text>
        </View>
        {searchFocused ? (
          <TouchableOpacity
            onPress={() => {
              setSearchFocused(false);
              Keyboard.dismiss();
            }}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      <View style={styles.startRow}>
        <View
          style={{
            flex: 1,
            maxWidth: "85%",
            height: 44,
            justifyContent: "center",
          }}
        >
          <GoogleAutocomplete
            placeholder="Onde você está?"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onPlaceSelect={(d) =>
              setStartLocation({
                lat: d.geometry.location.lat,
                lng: d.geometry.location.lng,
                name: d.name,
              })
            }
          />
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { height: 44, width: 44 }]}
          onPress={usarMinhaLocalizacao}
        >
          <Ionicons name="locate" size={24} color="#1677FF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { height: 44, width: 44 }]}
          onPress={() => setShowPrefs(true)}
        >
          <Ionicons name="options-outline" size={24} color="#1677FF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.generateBtn} onPress={gerarRoteiro}>
        <Text style={styles.generateText}>Gerar Roteiro Inteligente</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Locais Próximos</Text>
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 24 }}
          size="large"
          color="#1677FF"
        />
      ) : (
        <FlatList
          key="grid"
          data={places}
          keyExtractor={(i) => i.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 16,
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardAddress} numberOfLines={2}>
                {item.address}
              </Text>
              {item.price && <Text style={styles.cardPrice}>{item.price}</Text>}
            </View>
          )}
        />
      )}

      <PreferencesModal
        visible={showPrefs}
        onClose={() => setShowPrefs(false)}
        preferences={preferences}
        setPreferences={setPreferences}
      />

      {/* Modal de Mapa */}
      <Modal
        visible={showMap}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMap(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={{ flex: 1 }}>
            {loading || !startLocation ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#fff",
                }}
              >
                <ActivityIndicator size="large" color="#1677FF" />
                <Text style={{ marginTop: 16, color: "#1677FF", fontSize: 16 }}>
                  Obtendo sua localização...
                </Text>
              </View>
            ) : (
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: startLocation.lat,
                  longitude: startLocation.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                customMapStyle={mapStyle}
                zoomEnabled={true}
                rotateEnabled={true}
                showsUserLocation={true}
              >
                <Marker
                  coordinate={{
                    latitude: startLocation.lat,
                    longitude: startLocation.lng,
                  }}
                  title="Você está aqui"
                />
                <Circle
                  center={{
                    latitude: startLocation.lat,
                    longitude: startLocation.lng,
                  }}
                  radius={50}
                  strokeColor="#1677FF"
                  fillColor="rgba(22,119,255,0.1)"
                />
              </MapView>
            )}
            <View
              style={{
                position: "absolute",
                top: 32,
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 100,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowMap(false)}
                activeOpacity={0.85}
              >
                <View
                  style={{
                    backgroundColor: "#1677FF",
                    borderRadius: 24,
                    paddingVertical: 12,
                    paddingHorizontal: 40,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "bold",
                      letterSpacing: 1,
                    }}
                  >
                    Sair
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#1677FF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFF",
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#222" },
  cancelText: { fontSize: 16, color: "#1677FF" },

  startRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 16,
    marginRight: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },

  generateBtn: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#1677FF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  generateText: { color: "#FFF", fontSize: 16, fontWeight: "600" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
    marginTop: 16,
  },
  listContent: { paddingLeft: 16, paddingVertical: 8 },

  card: {
    flex: 1,
    minWidth: CARD_WIDTH,
    maxWidth: CARD_WIDTH,
    height: 160,
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginRight: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  cardImage: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#EEE",
  },
  cardName: { fontSize: 15, fontWeight: "600", color: "#222", marginBottom: 2 },
  cardAddress: { fontSize: 13, color: "#666", marginBottom: 4 },
  cardPrice: { fontSize: 14, color: "#1677FF", fontWeight: "600" },
});
