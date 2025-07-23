import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ExploreScreen from "../app/(tabs)/home";
import CalendarioScreen from "../app/(tabs)/calendar";
import RoteirosScreen from "../app/(tabs)/roteiro";
import PerfilScreen from "../app/(tabs)/perfil";

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <NavigationContainer theme={DefaultTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: "#6B46C1",
            tabBarInactiveTintColor: "#A0AEC0",
            tabBarStyle: {
              height: 60,
              paddingBottom: 5,
              paddingTop: 5,
              backgroundColor: "#FFFFFF",
              borderTopWidth: 0,
              elevation: 2,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              marginTop: -2,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              switch (route.name) {
                case "Início":
                  iconName = "home";
                  break;
                case "Calendário":
                  iconName = "calendar-today";
                  break;
                case "Explorar":
                  iconName = "search";
                  break;
                case "Roteiros":
                  iconName = "explore";
                  break;
                case "Perfil":
                  iconName = "person";
                  break;
                default:
                  iconName = "circle";
              }

              return (
                <MaterialIcons name={iconName} size={size} color={color} />
              );
            },
          })}
        >
          <Tab.Screen name="Calendário" component={CalendarioScreen} />
          <Tab.Screen
            name="Explorar"
            component={ExploreScreen}
            options={{
              tabBarLabel: "",
              tabBarIcon: ({ focused, color, size }) => (
                <MaterialIcons
                  name="search"
                  size={32}
                  color={focused ? "#FFFFFF" : "#6B46C1"}
                  style={{
                    backgroundColor: focused ? "#6B46C1" : "transparent",
                    borderRadius: 32,
                    padding: 6,
                  }}
                />
              ),
            }}
          />
          <Tab.Screen name="Roteiros" component={RoteirosScreen} />
          <Tab.Screen name="Perfil" component={PerfilScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
