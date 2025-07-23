import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

interface SelectionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({
  label,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.selectionButton,
      isSelected && styles.selectionButtonSelected,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.selectionButtonText,
        isSelected && styles.selectionButtonTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const NewItineraryScreen = () => {
  const router = useRouter();

  const [period, setPeriod] = useState<string | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);
  const [companions, setCompanions] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const activityOptions: string[] = [
    "Natureza",
    "Gastronomia",
    "Vida Noturna",
    "Eventos Culturais",
    "Património Histórico",
    "Bares",
    "Restaurantes",
    "Compras",
  ];
  const budgetOptions: string[] = ["Económico", "Intermédio", "Premium"];
  const companionsOptions: string[] = [
    "1 Pessoa",
    "Casal",
    "Família",
    "Grupo de Amigos",
  ];
  const periodOptions: string[] = ["Manhã", "Tarde", "Noite"];

  const toggleActivity = (activity: string) => {
    setActivities((prev: string[]) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSearch = () => {
    if (
      !period ||
      activities.length === 0 ||
      !budget ||
      !companions ||
      !startDate ||
      !endDate
    ) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha todas as opções, incluindo as datas, antes de procurar."
      );
      return;
    }

    const preferences = {
      period,
      activities,
      budget,
      companions,
      startDate,
      endDate,
    };

    router.push({
      pathname: "/recommended",
      params: { preferences: JSON.stringify(preferences) },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Novo Roteiro</Text>

        {}
        <Text style={styles.sectionTitle}>Período do Dia:</Text>
        <View style={styles.row}>
          {periodOptions.map((p) => (
            <SelectionButton
              key={p}
              label={p}
              isSelected={period === p}
              onPress={() => setPeriod(p)}
            />
          ))}
        </View>

        {}
        <Text style={styles.sectionTitle}>Tipos de Atividades:</Text>
        <View style={styles.row}>
          {activityOptions.map((a) => (
            <SelectionButton
              key={a}
              label={a}
              isSelected={activities.includes(a)}
              onPress={() => toggleActivity(a)}
            />
          ))}
        </View>

        {}
        <Text style={styles.sectionTitle}>Orçamento:</Text>
        <View style={styles.row}>
          {budgetOptions.map((b) => (
            <SelectionButton
              key={b}
              label={b}
              isSelected={budget === b}
              onPress={() => setBudget(b)}
            />
          ))}
        </View>

        {}
        <Text style={styles.sectionTitle}>Companhia:</Text>
        <View style={styles.row}>
          {companionsOptions.map((c) => (
            <SelectionButton
              key={c}
              label={c}
              isSelected={companions === c}
              onPress={() => setCompanions(c)}
            />
          ))}
        </View>

        {}
        <Text style={styles.sectionTitle}>Datas da Viagem:</Text>
        <TextInput
          style={styles.input}
          placeholder="Data de Início (DD/MM/AAAA)"
          value={startDate}
          onChangeText={setStartDate}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Data de Fim (DD/MM/AAAA)"
          value={endDate}
          onChangeText={setEndDate}
          keyboardType="numeric"
        />

        {}
        <Button title="Procurar Locais Recomendados" onPress={handleSearch} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
    color: "#555",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 15,
  },
  selectionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 5,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  selectionButtonSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  selectionButtonText: {
    color: "#333",
    fontSize: 14,
  },
  selectionButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    fontSize: 16,
  },
});

export default NewItineraryScreen;
