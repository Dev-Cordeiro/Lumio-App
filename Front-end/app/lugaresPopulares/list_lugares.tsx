import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../config/config";
import PlaceCard from "../../components/PlacedCard";

interface Waypoint {
  photoUrl?: string;
  imageUrl?: string;
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
  images?: string[];
  waypoints?: Waypoint[];
}

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

export default function AllRoteirosScreen() {
  const router = useRouter();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  /* --- util: caminho relativo → absoluto --- */
  const toAbsolute = (url?: string) =>
    url && !url.startsWith("http")
      ? `${API_URL}/${url.replace(/^\/+/, "")}`
      : url;

  const fetchRoteiros = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/places/roteiros`);
      if (!res.ok) throw new Error(`status ${res.status}`);

      const raw = await res.json();
      const formatted: Roteiro[] = raw.map((item: any) => ({
        ...item,
        image_url: toAbsolute(
          item.waypoints?.[0]?.photoUrl || item.images?.[0] || item.image_url
        ),
        waypoints: (item.waypoints || []).map((wp: any) => ({
          ...wp,
          photoUrl: toAbsolute(wp.photoUrl),
          imageUrl: toAbsolute(wp.imageUrl),
        })),
      }));
      setRoteiros(formatted);
    } catch (err) {
      console.error("Erro ao buscar roteiros:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoteiros();
  }, [fetchRoteiros]);

  return (
    <SafeAreaView style={styles.container}>
      {/* cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Roteiros Turísticos</Text>
          <Text style={styles.subtitle}>Todos os roteiros disponíveis</Text>
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#6B46C1" />
          <Text style={{ marginTop: 12, color: "#6B7280" }}>
            Carregando roteiros...
          </Text>
        </View>
      ) : (
        <FlatList
          data={roteiros}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PlaceCard
              name={item.title}
              location={item.location}
              imageUrl={item.image_url}
              price={item.price || "Preço não informado"}
              onPress={() => router.push(`/details/${item.id}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: "center", marginTop: 32 }}>
              Nenhum roteiro encontrado.
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: { marginRight: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1F2937" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  listContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingTop: 8,
    paddingBottom: 16,
  },
  row: { justifyContent: "space-between", marginBottom: CARD_MARGIN * 2 },
});
