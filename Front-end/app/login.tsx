import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/config";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { checkToken } = useAuth();

  async function handleLogin() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        // SAP: se seu backend retornar 400/401, pegue a mensagem
        throw new Error(data.message || "Erro ao entrar");
      }

      // aqui, data já é a Session (não { session: Session })
      const session = data.session ?? data;
      const token = session.access_token;

      if (token) {
        await AsyncStorage.setItem("access_token", token);
        await checkToken();
        router.replace("/home");
      } else {
        Alert.alert("Erro", "Credenciais inválidas");
      }
    } catch (error) {
      Alert.alert("Erro", (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entre agora</Text>
      <Text style={styles.subtitle}>
        Bem-vindo de volta, sentimos sua falta!
      </Text>

      <TextInput
        style={[styles.input, emailFocused && { borderColor: "#1677FF" }]}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setEmailFocused(true)}
        onBlur={() => setEmailFocused(false)}
      />

      <View
        style={[
          styles.input,
          styles.passwordContainer,
          passwordFocused && { borderColor: "#1677FF" },
        ]}
      >
        <TextInput
          style={styles.passwordInput}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((v) => !v)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Carregando..." : "Entrar"}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomLinks}>
        <Text style={styles.bottomText}>Não tem uma conta? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.linkText}>Criar nova conta</Text>
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
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  forgotText: {
    alignSelf: "flex-end",
    color: "#1677FF",
    marginBottom: 32,
    fontSize: 14,
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
