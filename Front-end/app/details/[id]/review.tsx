import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliação do Local</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.question}>O que você achou do Local?</Text>
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
        <Text style={styles.label}>Deixar comentário</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem"
          placeholderTextColor="#9CA3AF"
          multiline
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => {
            console.log({ id, rating, comment });
            router.back();
          }}
        >
          <Text style={styles.buttonText}>Avaliar agora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F7FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  content: { padding: 16, flex: 1 },
  question: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
    color: "#1F2937",
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 24,
    justifyContent: "center",
  },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8, color: "#4B5563" },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
