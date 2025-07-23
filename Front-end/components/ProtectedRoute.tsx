import React from "react";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const authRoutes = ["login", "register", "forgot-password"];
    const inAuthGroup = authRoutes.includes(segments[0]);

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}
