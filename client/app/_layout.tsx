import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import Auth from "@/components/Auth";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { SessionProvider, useSession } from "@/contexts/SessionContext"; // Import your session context

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session } = useSession(); // Access session from context

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      {session && session.user ? (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="wardrobe/new/item"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="wardrobe/new/outfit"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="wardrobe/new/look"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="wardrobe/view/look/[lookId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      ) : (
        <Auth />
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutContent />
    </SessionProvider>
  );
}
