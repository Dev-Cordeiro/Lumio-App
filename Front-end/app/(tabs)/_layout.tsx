import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme, View } from "react-native";
import "react-native-get-random-values";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useRoteiroNotification } from "@/contexts/RoteiroNotificationContext";

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const { hasNotification } = useRoteiroNotification();

  const backgroundColor = isDark ? "#1C1C1E" : "#FFFFFF";
  const activeTintColor = isDark ? "#0A84FF" : "#1677FF";
  const inactiveTintColor = isDark ? "#8E8E93" : "#A0A4A8";
  const exploreBg = isDark ? "#0A84FF" : "#1677FF";
  const exploreShadow = isDark
    ? "rgba(10,132,255,0.3)"
    : "rgba(22,119,255,0.18)";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          height: 70,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor,
          position: "absolute",
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          marginTop: 0,
          marginBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={focused ? activeTintColor : color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendário",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name="calendar"
              color={focused ? activeTintColor : color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: exploreBg,
                justifyContent: "center",
                alignItems: "center",
                top: -24,
                shadowColor: exploreBg,
                shadowOpacity: 0.3,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 12,
              }}
            >
              <IconSymbol size={32} name="magnifyingglass" color="#FFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="roteiro"
        options={{
          title: "Roteiros",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: "relative" }}>
              <IconSymbol
                size={28}
                name="map"
                color={focused ? activeTintColor : color}
              />
              {hasNotification && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#FF3B30",
                    borderWidth: 2,
                    borderColor: backgroundColor,
                  }}
                />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name="person"
              color={focused ? activeTintColor : color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
