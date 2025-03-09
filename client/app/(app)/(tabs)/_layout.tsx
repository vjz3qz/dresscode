import { Tabs } from "expo-router";
import React, { useEffect, useRef } from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tabBarHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate tab bar appearance
    Animated.timing(tabBarHeight, {
      toValue: 95,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, []);

  const translateY = tabBarHeight.interpolate({
    inputRange: [0, 95],
    outputRange: [95, 0],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#EAE6E5" }}>
      <Tabs
        screenOptions={({ route }) => ({
          // tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          tabBarActiveTintColor: "#333",
          tabBarInactiveTintColor: "#6b7280",
          tabBarStyle: {
            backgroundColor: "#EAE6E5",
            borderTopWidth: 0,
            paddingVertical: 10,
            height: 95, // Increase height for larger buttons
            transform: [{ translateY }],
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
          },
          tabBarItemStyle: {
            marginVertical: 5,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
          headerShown: false,
          // tabBarButton: (props) => {
          //   const { ref, ...restProps } = props;
          //   return (
          //     <View style={styles.tabButtonContainer}>
          //       <Animated.View
          //         style={[
          //           styles.tabButton,
          //           props.accessibilityState?.selected &&
          //             styles.activeTabButton,
          //         ]}
          //       >
          //         <Animated.View {...restProps} />
          //       </Animated.View>
          //       {props.accessibilityState?.selected && (
          //         <View style={styles.activeIndicator} />
          //       )}
          //     </View>
          //   );
          // },
        })}
      >
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
          name="index"
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
          name="calendar"
          options={{
            title: "calendar",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "calendar" : "calendar-outline"}
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
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabButtonContainer: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    transform: [{ scale: 1.05 }],
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: width / 10,
    height: 3,
    backgroundColor: "#333",
    borderRadius: 1.5,
  },
});
