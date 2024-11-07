import { Tabs } from "expo-router";
import React from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarActiveTintColor: Colors["dark"].tint,
        tabBarInactiveTintColor: "#333", // Set your desired inactive tint color
        tabBarStyle: {
          backgroundColor: "#EAE6E5", // Set your desired background color
          borderTopWidth: 0, // Remove top border for a cleaner look
          paddingVertical: 10, // Increase vertical padding for better spacing
          height: 95, // Increase height for larger buttons
        },
        tabBarLabelStyle: {
          fontSize: 12, // Adjust font size for labels
          fontWeight: "500",
        },
        tabBarItemStyle: {
          marginVertical: 5, // Add vertical margin for icon spacing
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "explore",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "shopping" : "shopping-outline"}
              color={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "social",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "globe" : "globe-outline"}
              color={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: "wardrobe",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "wardrobe" : "wardrobe-outline"}
              color={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person" : "person-outline"}
              color={color}
              size={28}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="test"
        options={{
          title: "test",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "settings" : "settings-outline"}
              color={color}
              size={28}
            />
          ),
        }}
      /> */}
    </Tabs>
  );
}
