import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import "react-native-get-random-values";

export default function IndexRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/welcome");
      }
    }
  }, [isAuthenticated, loading]);

  return null;
}
