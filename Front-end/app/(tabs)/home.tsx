import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "../../config/config";
import StyledRoteiroCard, {
  Waypoint,
} from "../../components/StyledRoteiroCard";
import { useAuth } from "../../contexts/AuthContext";

/* -------------------------------------------------- */
/*  Tipos                                              */
/* -------------------------------------------------- */
interface Roteiro {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  description: string;
  image_url: string; // capa do card (será normalizada abaixo)
  images?: string[]; // lista extra de imagens
  waypoints: Waypoint[];
}

/* -------------------------------------------------- */
/*  Componente                                         */
/* -------------------------------------------------- */
export default function HomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------- util: converte caminho relativo em URL absoluta ---------- */
  const toAbsolute = (url?: string) =>
    url && !url.startsWith("http")
      ? `${API_URL}/${url.replace(/^\/+/, "")}`
      : url;

  /* ---------- carrega os roteiros da API ---------- */
  const fetchRoteiros = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/places/roteiros`);
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();
      const formatted: Roteiro[] = data.map((item: any) => ({
        ...item,
        /* prioridade da capa: primeiro waypoint.photoUrl > primeira imagem > image_url original */
        image_url: toAbsolute(
          item.waypoints?.[0]?.photoUrl || item.images?.[0] || item.image_url
        ),
        /* normaliza URLs internas dos waypoints */
        waypoints: (item.waypoints || []).map((wp: any) => ({
          ...wp,
          photoUrl: toAbsolute(wp.photoUrl),
          imageUrl: toAbsolute(wp.imageUrl),
        })),
      }));
      setRoteiros(formatted);
    } catch (err) {
      console.error("Erro ao buscar roteiros:", err);
      setRoteiros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoteiros();
  }, [fetchRoteiros]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRoteiros();
    setRefreshing(false);
  }, [fetchRoteiros]);

  const displayName =
    user?.user_metadata?.full_name || user?.email || "Visitante";

  /* -------------------------------------------------- */
  /*  Render                                            */
  /* -------------------------------------------------- */
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.userBadge}>
          <Image
            source={require("../../assets/images/avatar.png")}
            style={styles.userAvatar}
          />
          {authLoading ? (
            <ActivityIndicator
              size="small"
              color="#2D3748"
              style={{ marginLeft: 8 }}
            />
          ) : (
            <Text style={styles.userText}>{displayName}</Text>
          )}
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.iconButton}>
          <MaterialIcons name="refresh" size={24} color="#2D3748" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.headerContainer}>
        <Image source={require("../../assets/images/palavraTopo.png")} />
      </View>

      {/* Conteúdo */}
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Melhores Destinos</Text>
          <TouchableOpacity
            onPress={() => router.push("/lugaresPopulares/list_lugares")}
          >
            <Text style={styles.viewAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text style={styles.loadingText}>Carregando roteiros...</Text>
          </View>
        ) : (
          <FlatList
            data={roteiros.slice(0, 3)} // mostra só 3 cards
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <StyledRoteiroCard
                imageUrl={{ uri: item.image_url }}
                title={item.title}
                location={item.location}
                rating={item.rating}
                waypoints={item.waypoints}
                interactiveMap={false}
                onPress={() => router.push(`/details/${item.id}`)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------- */
/*  Estilos                                           */
/* -------------------------------------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7FAFC" },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userAvatar: { width: 32, height: 32, borderRadius: 16 },
  userText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },
  iconButton: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  container: { flex: 1 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#2D3748" },
  viewAllText: { fontSize: 14, fontWeight: "500", color: "#6B46C1" },
  carouselContent: { paddingLeft: 16, paddingTop: 8, paddingBottom: 32 },
  loadingContainer: { marginTop: 32, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#718096" },
});
