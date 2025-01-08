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
import { ActivityIndicator, View, Image, StatusBar } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session, loading } = useSession(); // Add loading here

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (loading || !loaded) {
    // loading page: add dresscode logo
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#E6E1DF",
        }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{
            width: 390,
            height: 575,
            resizeMode: "contain",
          }}
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar barStyle="dark-content" />
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
            name="wardrobe/view/looks/[lookId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="wardrobe/view/items/[itemId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="wardrobe/view/outfits/[outfitId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="wardrobe/view/outfitsFeed"
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
