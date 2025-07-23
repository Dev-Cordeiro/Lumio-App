// src/screens/CalendarioScreen.tsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
  format,
  isSameDay,
  addWeeks,
  addMonths,
  startOfWeek,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { API_URL } from "../../config/config";

interface Roteiro {
  id: string;
  scheduled_at?: string | null;
  title: string;
  subtitle: string;
  image_url?: string | null;
  imageUrl?: string | null;
}

const dayLetters = ["D", "S", "T", "Q", "Q", "S", "S"];
const PLACEHOLDER = "https://via.placeholder.com/80";

const toAbsolute = (url?: string) =>
  url && !url.startsWith("http")
    ? `${API_URL}/${url.replace(/^\/+/, "")}`
    : url;

export default function CalendarioScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch and map images, filter out null scheduled_at
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/places/roteiros`);
        const json: Roteiro[] = await res.json();
        const mapped = json
          .filter((r) => !!r.scheduled_at)
          .map((r) => ({
            ...r,
            imageUrl: toAbsolute(
              (r as any).waypoints?.[0]?.photoUrl || r.image_url
            ),
          }));
        setRoteiros(mapped);
      } catch (err) {
        console.error("Erro ao buscar roteiros:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Build week days array
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map(
      (_, i) =>
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    );
  }, [selectedDate]);

  // Filter roteiros for selected day
  const meus = useMemo(
    () =>
      roteiros.filter((r) => {
        if (!r.scheduled_at) return false;
        return isSameDay(parseISO(r.scheduled_at), selectedDate);
      }),
    [roteiros, selectedDate]
  );

  // Count roteiros on a given day
  const countOnDay = useCallback(
    (date: Date) =>
      roteiros.filter((r) => {
        if (!r.scheduled_at) return false;
        return isSameDay(parseISO(r.scheduled_at), date);
      }).length,
    [roteiros]
  );

  // Render a single day in the week strip
  const renderDay = ({ item }: { item: Date }) => {
    const ativo = isSameDay(item, selectedDate);
    const count = countOnDay(item);

    return (
      <TouchableOpacity
        style={[styles.dayItem, ativo && styles.dayItemActive]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[styles.dayLetter, ativo && styles.dayLetterActive]}>
          {dayLetters[item.getDay()]}
        </Text>
        <Text style={[styles.dayNumber, ativo && styles.dayNumberActive]}>
          {format(item, "d", { locale: ptBR })}
        </Text>
        {count > 0 &&
          (count === 1 ? (
            <View style={[styles.dot, ativo && styles.dotActive]} />
          ) : (
            <View style={[styles.badge, ativo && styles.badgeActive]}>
              <Text style={[styles.badgeText, ativo && styles.badgeTextActive]}>
                {count}
              </Text>
            </View>
          ))}
      </TouchableOpacity>
    );
  };

  // Render a roteiro card
  const renderRoteiro = ({ item }: { item: Roteiro }) => {
    const dateLabel = item.scheduled_at
      ? format(parseISO(item.scheduled_at), "dd MMM yyyy", { locale: ptBR })
      : "Data não definida";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/roteiro`)}
      >
        <Image
          source={{ uri: item.imageUrl || PLACEHOLDER }}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.dateRow}>
            <MaterialIcons name="calendar-today" size={16} color="#555" />
            <Text style={styles.cardDate}>{dateLabel}</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          <View style={styles.cardArrowContainer}>
            <MaterialIcons name="chevron-right" size={24} color="#BBB" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendário</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          onPress={() => setSelectedDate((d) => addMonths(d, -1))}
        >
          <MaterialIcons name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
        </Text>
        <TouchableOpacity
          onPress={() => setSelectedDate((d) => addMonths(d, 1))}
        >
          <MaterialIcons name="chevron-right" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Week strip */}
      <View style={styles.calendarContainer}>
        <TouchableOpacity
          onPress={() => setSelectedDate((d) => addWeeks(d, -1))}
        >
          <MaterialIcons name="navigate-before" size={24} color="#333" />
        </TouchableOpacity>
        <FlatList
          data={weekDays}
          horizontal
          keyExtractor={(d) => d.toISOString()}
          renderItem={renderDay}
          contentContainerStyle={styles.weekList}
          showsHorizontalScrollIndicator={false}
        />
        <TouchableOpacity
          onPress={() => setSelectedDate((d) => addWeeks(d, 1))}
        >
          <MaterialIcons name="navigate-next" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Roteiros list */}
      <Text style={styles.sectionTitle}>Meus Roteiros</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color="#6B46C1" />
      ) : (
        <FlatList
          data={meus}
          keyExtractor={(r) => r.id}
          renderItem={renderRoteiro}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>Nenhum roteiro nesta data.</Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 12,
  },
  calendarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  weekList: { flexGrow: 1, justifyContent: "center" },
  dayItem: {
    width: 48,
    alignItems: "center",
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  dayItemActive: { backgroundColor: "#1677FF" },
  dayLetter: { fontSize: 12, color: "#555" },
  dayLetterActive: { color: "#FFF" },
  dayNumber: { fontSize: 16, fontWeight: "600", color: "#555" },
  dayNumberActive: { color: "#FFF" },
  dot: {
    marginTop: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1677FF",
  },
  dotActive: { backgroundColor: "#FFF" },
  // badge for multiple roteiros
  badge: {
    marginTop: 3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1677FF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeActive: { backgroundColor: "#FFF" },
  badgeText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "600",
  },
  badgeTextActive: { color: "#1677FF" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
    marginTop: 16,
  },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  emptyText: { textAlign: "center", color: "#777", marginTop: 20 },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { width: 80, height: 80 },
  cardContent: { flex: 1, padding: 12, position: "relative" },
  dateRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cardDate: { fontSize: 12, color: "#555", marginLeft: 4 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#222" },
  cardSubtitle: { fontSize: 12, color: "#777", marginTop: 2 },
  cardArrowContainer: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
});
