// src/screens/PerfilScreen.tsx

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../contexts/AuthContext";
import { API_URL } from "../../config/config";

const avatar = require("../../assets/images/avatar.png");

type Stat = { label: string; value: number };

export default function PerfilScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState<Stat[]>([
    { label: "Pontos", value: 0 },
    { label: "Roteiros", value: 0 },
    { label: "Desejos", value: 0 },
  ]);

  useEffect(() => {
    async function loadStats() {
      if (!user || !token) return;

      try {
        const res = await fetch(`${API_URL}/users/me/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        setStats([
          { label: "Pontos", value: 360 },
          { label: "Roteiros", value: json.roteiros },
          { label: "Desejos", value: 473 },
        ]);
      } catch (err) {
        console.warn(
          "Erro ao buscar roteiros, mockando apenas Roteiros=0:",
          err
        );

        setStats([
          { label: "Pontos", value: 360 },
          { label: "Roteiros", value: 0 },
          { label: "Desejos", value: 473 },
        ]);
      }
    }
    loadStats();
  }, [user, token]);

  const handleLogout = async () => {
    await logout();
  };

  const name = user?.user_metadata?.full_name || "Usuário";
  const email = user?.email || "—";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity onPress={() => router.push("/perfil/edit")}>
          <MaterialIcons name="edit" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image source={avatar} style={styles.avatar} />

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/")}
          >
            <MaterialIcons
              name="bookmark-border"
              size={24}
              color="#555"
              style={styles.menuIcon}
            />
            <Text style={styles.menuLabel}>Favoritos</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color="#BBB"
              style={styles.menuArrow}
            />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    justifyContent: "space-between",
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  content: {
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginTop: 16,
    backgroundColor: "#EEE",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 12,
    color: "#222",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    marginHorizontal: 4,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: "#1677FF" },
  statLabel: { fontSize: 12, color: "#555", marginTop: 4 },
  menuCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: { marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 16, color: "#333" },
  menuArrow: {},
  logoutButton: {
    marginTop: 16,
    backgroundColor: "#E53E3E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFF",
    fontWeight: "600",
  },
});
