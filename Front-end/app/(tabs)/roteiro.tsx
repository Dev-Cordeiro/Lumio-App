// src/screens/RoteirosScreen.tsx
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
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { WebSocketStatus } from "@/components/WebSocketStatus";
import { useRoteiroNotification } from "@/contexts/RoteiroNotificationContext";
import { useRoteiroEvents } from "@/contexts/WebSocketContext";
import MeusRoteirosCard from "@/components/MeusRoteirosCard";
import { API_URL } from "@/config/config";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const toAbsolute = (url?: string) =>
  url && !url.startsWith("http")
    ? `${API_URL}/${url.replace(/^\/+/, "")}`
    : url;

export default function RoteirosScreen() {
  const router = useRouter();

  const [roteiros, setRoteiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { setHasNotification } = useRoteiroNotification();
  const { subscribeToRoteiroPronto } = useRoteiroEvents();

  const fetchRoteiros = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/places/me/roteiros`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = res.ok ? await res.json() : [];
      setRoteiros(
        raw.map((it: any) => ({
          ...it,
          imageUrl: toAbsolute(
            it.waypoints?.[0]?.photoUrl || it.images?.[0] || it.image_url
          ),
        }))
      );
    } catch (err) {
      console.error(err);
      setRoteiros([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void fetchRoteiros(), [fetchRoteiros]);
  useFocusEffect(useCallback(() => void fetchRoteiros(), [fetchRoteiros]));

  useEffect(() => {
    let isMounted = true;
    const unsub = subscribeToRoteiroPronto(() => {
      if (!isMounted) return;
      setHasNotification(true);
      fetchRoteiros();
      Alert.alert("Roteiro Pronto!", "Seu roteiro foi criado com sucesso.");
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [subscribeToRoteiroPronto, setHasNotification, fetchRoteiros]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRoteiros();
    setRefreshing(false);
  }, [fetchRoteiros]);

  const toggleSelect = (id: string) => {
    const s = new Set(selectedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedIds(s);
  };

  const openPicker = (id: string, existing?: string) => {
    setCurrentId(id);
    setDate(existing ? new Date(existing) : new Date());
    setPickerOpen(true);
  };

  const confirmDate = async (d: Date) => {
    if (!currentId) return;
    try {
      const token = await AsyncStorage.getItem("access_token");
      await fetch(`${API_URL}/places/roteiros/${currentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scheduled_at: d.toISOString() }),
      });
      await fetchRoteiros();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível agendar o roteiro.");
    } finally {
      setPickerOpen(false);
      setCurrentId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          isSelectionMode
            ? toggleSelect(item.id)
            : router.push(`/details/${item.id}`)
        }
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedIds(new Set([item.id]));
          }
        }}
      >
        {isSelectionMode && (
          <View style={styles.checkOverlay}>
            <MaterialIcons
              name={
                selectedIds.has(item.id)
                  ? "check-circle"
                  : "radio-button-unchecked"
              }
              size={24}
              color={selectedIds.has(item.id) ? "#1677FF" : "#AAA"}
            />
          </View>
        )}

        <MeusRoteirosCard
          name={item.title}
          location={item.location}
          imageUrl={item.imageUrl}
          price={item.price || "Preço não informado"}
        />

        {item.scheduled_at && (
          <Text style={styles.dateTag}>
            Agendado: {new Date(item.scheduled_at).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.calendarBtn}
        onPress={() => openPicker(item.id, item.scheduled_at)}
      >
        <MaterialIcons name="calendar-today" size={24} color="#555" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6B46C1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebSocketStatus />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Roteiros</Text>
        <TouchableOpacity
          onPress={() => {
            setIsSelectionMode(!isSelectionMode);
            if (isSelectionMode) setSelectedIds(new Set());
          }}
        >
          <MaterialIcons
            name={isSelectionMode ? "close" : "more-vert"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#AAA" />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar roteiro"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={roteiros.filter((r) =>
          r.title.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhum roteiro encontrado.</Text>
        )}
      />

      {/* Novo DateTimePickerModal */}
      <DateTimePickerModal
        isVisible={pickerOpen}
        mode="date"
        date={date}
        onConfirm={confirmDate}
        onCancel={() => setPickerOpen(false)}
        locale="pt-BR"
        display="default"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchInput: { flex: 1, marginLeft: 8, height: 40, fontSize: 14 },

  list: { paddingHorizontal: CARD_MARGIN, paddingBottom: 16 },
  row: { justifyContent: "space-between", marginBottom: CARD_MARGIN * 2 },

  cardWrapper: { width: CARD_WIDTH, marginBottom: 16, position: "relative" },
  checkOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 16,
    padding: 2,
  },
  dateTag: { marginTop: 4, fontSize: 12, color: "#555", textAlign: "center" },
  calendarBtn: { position: "absolute", top: 8, left: 8, zIndex: 10 },

  emptyText: { textAlign: "center", marginTop: 32, color: "#777" },
});
