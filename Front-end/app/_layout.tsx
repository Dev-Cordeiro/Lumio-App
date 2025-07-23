import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
// Adicione os imports que vamos usar para a lógica de redirect
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { RoteiroNotificationProvider } from "../contexts/RoteiroNotificationContext";
import { WebSocketProvider } from "../contexts/WebSocketContext";
import SplashScreen from "../components/SplashScreen";
import Onboarding from "../components/Onboarding";
import "react-native-get-random-values";

export default function LayoutWithAuth() {
  const [loadedFonts] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  if (!loadedFonts) return <SplashScreen />;

  return (
    <ThemeProvider value={DefaultTheme}>
      <WebSocketProvider>
        <AuthProvider>
          <RoteiroNotificationProvider>
            <InnerLayout />
            <StatusBar style="auto" />
          </RoteiroNotificationProvider>
        </AuthProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

function InnerLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("onboardingSeen").then((v) =>
      setShowOnboarding(v !== "true")
    );
  }, []);

  useEffect(() => {
    if (loading || showOnboarding === null) return;

    const inAuthScreens =
      segments[0] === "login" ||
      segments[0] === "register" ||
      segments[0] === "welcome" ||
      segments[0] === "forgot-password";

    if (!isAuthenticated && !inAuthScreens) {
      router.replace("/welcome");
    } else if (isAuthenticated && inAuthScreens) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, loading, showOnboarding, segments]);

  if (loading || showOnboarding === null) {
    return <SplashScreen />;
  }

  if (showOnboarding) {
    return <Onboarding />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="details/[id]" />
      <Stack.Screen name="details/[id]/review" />
      <Stack.Screen name="perfil/edit" />
      <Stack.Screen name="lugaresPopulares/list_lugares" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" options={{ headerShown: true }} />
    </Stack>
  );
}
