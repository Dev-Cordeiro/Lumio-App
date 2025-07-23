import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

interface Preferences {
  period: string[];
  types: string[];
  budget: string[];
  company: string[];
  budgetValue?: number;
  descricao?: string;
}

interface PreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
}

export default function PreferencesModal({
  visible,
  onClose,
  preferences,
  setPreferences,
}: PreferencesModalProps) {
  const periods = ["Manhã", "Tarde", "Noite"];
  const types = [
    "Bares",
    "Restaurante",
    "Natureza",
    "Museus",
    "Eventos Locais",
    "Cultura",
    "Compras",
  ];
  const budgets = ["Baixo", "Médio", "Alto"];
  const companies = ["Sozinho", "Casal", "Família"];

  const scrollViewRef = useRef<ScrollView>(null);

  function toggleOption(category: keyof Preferences, value: string) {
    if (category === "budgetValue") return;
    setPreferences((prev: Preferences) => ({
      ...prev,
      [category]:
        Array.isArray(prev[category]) && prev[category].includes(value)
          ? (prev[category] as string[]).filter((v: string) => v !== value)
          : [...(Array.isArray(prev[category]) ? prev[category] : []), value],
    }));
  }
  const budgetValue = preferences.budgetValue ?? 100;
  const sliderMax = Math.max(10000, budgetValue);

  function handleBudgetChange(value: number) {
    setPreferences((prev: Preferences) => ({ ...prev, budgetValue: value }));
  }

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      propagateSwipe
      avoidKeyboard
    >
      <View style={styles.modalContent}>
        <View style={styles.dragBar} />
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <Text style={styles.title}>Defina suas Preferências</Text>
          <Text style={styles.section}>Período do dia</Text>
          <View style={styles.optionsRow}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.option,
                  preferences.period.includes(p) && styles.optionSelected,
                ]}
                onPress={() => toggleOption("period", p)}
              >
                <Text
                  style={
                    preferences.period.includes(p)
                      ? styles.optionTextSelected
                      : styles.optionText
                  }
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.section}>Tipos de locais</Text>
          <View style={styles.optionsRow}>
            {types.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.option,
                  preferences.types.includes(t) && styles.optionSelected,
                ]}
                onPress={() => toggleOption("types", t)}
              >
                <Text
                  style={
                    preferences.types.includes(t)
                      ? styles.optionTextSelected
                      : styles.optionText
                  }
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.section}>Orçamento</Text>
          <View style={styles.sliderRow}>
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={0}
              maximumValue={sliderMax}
              step={10}
              value={budgetValue}
              onValueChange={handleBudgetChange}
              minimumTrackTintColor="#1677ff"
              maximumTrackTintColor="#eee"
              thumbTintColor="#1677ff"
            />
            <TextInput
              style={styles.budgetInput}
              keyboardType="numeric"
              value={String(budgetValue)}
              onChangeText={(text) => {
                let val = parseInt(text.replace(/[^0-9]/g, ""));
                if (isNaN(val)) val = 0;
                handleBudgetChange(val);
              }}
              maxLength={8}
            />
          </View>
          <Text style={styles.section}>Companhia</Text>
          <View style={styles.optionsRow}>
            {companies.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.option,
                  preferences.company.includes(c) && styles.optionSelected,
                ]}
                onPress={() => toggleOption("company", c)}
              >
                <Text
                  style={
                    preferences.company.includes(c)
                      ? styles.optionTextSelected
                      : styles.optionText
                  }
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.section}>
            Descreva como gostaria do seu roteiro
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Quero um roteiro mais cultural, com passeios ao ar livre..."
            value={preferences.descricao || ""}
            onChangeText={(text) =>
              setPreferences((prev: Preferences) => ({
                ...prev,
                descricao: text,
              }))
            }
            multiline
            numberOfLines={3}
            placeholderTextColor="#888"
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
          <TouchableOpacity style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Aplicar Preferências</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  dragBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#222",
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  option: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    margin: 4,
  },
  optionSelected: { backgroundColor: "#6c47ff", borderColor: "#6c47ff" },
  optionText: { color: "#222" },
  optionTextSelected: { color: "#fff", fontWeight: "bold" },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginHorizontal: 4,
  },
  budgetValue: {
    width: 60,
    textAlign: "right",
    fontWeight: "bold",
    color: "#1677ff",
    fontSize: 16,
  },
  budgetInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: "#1677ff",
    borderRadius: 8,
    textAlign: "center",
    fontWeight: "bold",
    color: "#1677ff",
    fontSize: 16,
    marginLeft: 8,
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: "#1677ff",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
