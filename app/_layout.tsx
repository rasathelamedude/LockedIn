import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { runMigrations } from "../database/migrate";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCallback, useEffect, useState } from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
// import { deleteActiveSessions } from "@/database/queries/sessions";

export const unstable_settings = {
  anchor: "(tabs)",
};

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "#10b981" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 16, fontWeight: "600" }}
      text2Style={{ fontSize: 14 }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: "#ef4444" }}
      text1Style={{ fontSize: 16, fontWeight: "600" }}
      text2Style={{ fontSize: 14 }}
    />
  ),
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isDbReady, setIsDbReady] = useState(false);

  const fetchData = useCallback(async () => {
    await runMigrations();
    // await deleteActiveSessions();
    setIsDbReady(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!isDbReady) {
    return null; // or a loading indicator
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="create_goal" options={{ headerShown: false }} />
        <Stack.Screen name="goal/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
