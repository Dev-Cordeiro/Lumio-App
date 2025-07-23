import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { API_URL } from "../config/config";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, phoneNumber }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao cadastrar");
      Alert.alert(
        "Sucesso",
        "Cadastro realizado! Verifique seu email para confirmar a conta.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      Alert.alert("Erro", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastre-se</Text>
      <Text style={styles.subtitle}>Crie sua conta e comece agora!</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        placeholderTextColor="#888"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefone (ex: 11999999999)"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Digite sua senha (mín. 8 caracteres)"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirme sua senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Carregando..." : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomLinks}>
        <Text style={styles.bottomText}>Já tem uma conta? </Text>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.linkText}>Faça login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1677FF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F2F4FA",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1677FF",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: {
    color: "#444",
    fontSize: 15,
  },
  linkText: {
    color: "#1677FF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
