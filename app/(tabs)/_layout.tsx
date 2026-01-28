import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopWidth: 1,
          borderTopColor: "#1a1a1a",
          height: 88,
          paddingBottom: 24,
          paddingTop: 12,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          position: "absolute",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.5,
          marginTop: 4,
        },
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#4a4a4a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: "Timer",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="timer" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="analytics" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="psychology" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
