// app/welcome.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Imagem no topo */}
      <Image
        source={require("../assets/images/top-image-wel.png")}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require("../assets/images/Logo-com-nome.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Botões no estilo do LoginScreen */}
        <TouchableOpacity
          style={[styles.button, { marginBottom: 12 }]}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.replace("/register")}
        >
          <Text style={styles.outlineButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerImage: {
    width,
    height: height * 0.4,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#1677FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  outlineButton: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#1677FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#1677FF",
    fontSize: 17,
    fontWeight: "bold",
  },
});
