import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Animated,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "../../../config/config";
import MapView, { Marker } from "react-native-maps";

const { width: screenWidth } = Dimensions.get("window");
const BORDER_RADIUS = 24;
const AVATAR_SIZE = 48;

interface Waypoint {
  name: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

interface Roteiro {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  image_url: string;
  waypoints: Waypoint[];
}

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [roteiro, setRoteiro] = useState<Roteiro | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"details" | "review">("details");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const H_DETAILS = screenWidth;
  const H_REVIEW = screenWidth * 0.6;
  const heightAnim = useRef(new Animated.Value(H_DETAILS)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: mode === "details" ? H_DETAILS : H_REVIEW,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [mode]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/places/roteiros/${id}`);
        if (res.status === 404) {
          Alert.alert("Ops!", "Roteiro não encontrado.", [
            { text: "OK", onPress: () => router.back() },
          ]);
          return;
        }
        if (!res.ok) throw new Error("Erro ao buscar roteiro");
        const data: Roteiro = await res.json();
        setRoteiro(data);
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível carregar o roteiro.", [
          { text: "Voltar", onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </SafeAreaView>
    );
  }
  if (!roteiro) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Roteiro não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#1677FF", marginTop: 16 }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleToggle = () =>
    setMode((prev) => (prev === "details" ? "review" : "details"));

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaView style={styles.wrapper}>
        <Animated.View style={{ height: heightAnim, width: "100%" }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: roteiro.waypoints?.[0]?.latitude || -10.2,
              longitude: roteiro.waypoints?.[0]?.longitude || -48.3,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {roteiro.waypoints?.map((wp, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: wp.latitude, longitude: wp.longitude }}
                title={wp.name}
              />
            ))}
          </MapView>
        </Animated.View>

        <TouchableOpacity
          style={[styles.topButton, { left: 16 }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.bottomContainer}>
          {mode === "details" ? (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <TouchableOpacity
                style={styles.toggleBar}
                onPress={handleToggle}
              />

              <View style={styles.destinationHeader}>
                <Text style={styles.destinationTitle}>{roteiro.title}</Text>
                <Image
                  source={require("../../../assets/images/avatar.png")}
                  style={styles.destinationAvatar}
                />
              </View>

              <View style={styles.locationAndRatingRow}>
                <MaterialIcons name="place" size={16} color="#6B7280" />
                <Text style={styles.locationText}>{roteiro.location}</Text>
                <View style={styles.ratingWrapper}>
                  <MaterialIcons name="star" size={16} color="#F6BA00" />
                  <Text style={styles.ratingText}>
                    {roteiro.rating.toFixed(1)} ({roteiro.reviews})
                  </Text>
                </View>
              </View>

              {/* Preço + imagens dos lugares */}
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.priceText}>{roteiro.price}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 8 }}
                >
                  {roteiro.waypoints?.slice(0, 5).map((wp, idx) => (
                    <Image
                      key={idx}
                      source={{
                        uri: wp.photoUrl || "https://via.placeholder.com/60",
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                    />
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.sectionLabel}>Sobre o Destino</Text>
              <Text style={styles.descriptionText}>{roteiro.description}</Text>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.reviewBody}>
              <TouchableOpacity
                style={styles.toggleBar}
                onPress={handleToggle}
              />
              <Text style={styles.reviewTitle}>Avaliação do Local</Text>

              <View style={styles.destinationHeader}>
                <Text style={styles.destinationTitle}>{roteiro.title}</Text>
                <Image
                  source={require("../../../assets/images/avatar.png")}
                  style={styles.destinationAvatar}
                />
              </View>

              <View style={styles.locationAndRatingRow}>
                <MaterialIcons name="place" size={16} color="#6B7280" />
                <Text style={styles.locationText}>{roteiro.location}</Text>
                <View style={styles.ratingWrapper}>
                  <MaterialIcons name="star" size={16} color="#F6BA00" />
                  <Text style={styles.ratingText}>
                    {roteiro.rating.toFixed(1)} ({roteiro.reviews})
                  </Text>
                </View>
              </View>

              <Text style={styles.reviewQuestion}>
                O que você achou do Local?
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)}>
                    <MaterialIcons
                      name={i <= rating ? "star" : "star-border"}
                      size={40}
                      color="#F6BA00"
                      style={{ marginHorizontal: 4 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider} />
              <Text style={styles.reviewLabel}>Deixar comentário</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Digite sua mensagem"
                multiline
                value={comment}
                onChangeText={setComment}
              />
            </ScrollView>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (mode === "details") setMode("review");
              else router.back();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>
              {mode === "details" ? "Avaliar Local" : "Enviar Avaliação"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFF" },
  topButton: {
    position: "absolute",
    top: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 6,
    borderRadius: 20,
  },
  toggleBar: {
    width: 60,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 12,
  },
  bottomContainer: {
    flex: 1,
    marginTop: -BORDER_RADIUS,
    backgroundColor: "#FFF",
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  scrollContent: { padding: 16, paddingBottom: 140 },
  destinationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  destinationTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 12,
    flexWrap: "wrap",
    lineHeight: 30,
  },
  destinationAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  locationAndRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: { marginLeft: 4, fontSize: 14, color: "#6B7280" },
  ratingWrapper: { flexDirection: "row", alignItems: "center", marginLeft: 12 },
  ratingText: { marginLeft: 4, fontSize: 14, color: "#1F2937" },
  priceText: { fontSize: 16, fontWeight: "600", color: "#2563EB" },
  sectionLabel: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  descriptionText: { fontSize: 14, color: "#4B5563", lineHeight: 20 },
  reviewBody: { padding: 16, paddingBottom: 140 },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  reviewQuestion: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 20,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 16 },
  reviewLabel: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  reviewInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  actionButton: {
    backgroundColor: "#2563EB",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
