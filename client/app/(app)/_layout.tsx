import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { SessionProvider, useSession } from "@/contexts/SessionContext";
import { StatusBar, View } from "react-native";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session, loading, profileNotFound } = useSession();
  console.log("loading", loading);
  console.log("profileNotFound", profileNotFound);

  const [appReady, setAppReady] = useState(false);
  console.log("appReady", appReady);

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Set app as ready once fonts are loaded and auth state is determined
  useEffect(() => {
    if (fontsLoaded && !loading) {
      setAppReady(true);
    }
  }, [fontsLoaded, loading]);

  // NEW: Hide the splash screen when the app is ready,
  // regardless of what you render (even if it's a Redirect).
  useEffect(() => {
    if (appReady) {
      console.log("App is ready. Hiding splash screen...");
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  // While waiting for fonts and auth, keep the splash visible
  if (!appReady) {
    return null; // Keeps the splash screen visible
  }

  // Redirect logic based on authentication state

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!(session && session.user)) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/(auth)" />;
  } else if (profileNotFound) {
    return <Redirect href="/(auth)/signup/UserInfo" />;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar barStyle="dark-content" />
      {/* <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="new/wardrobe/item"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="new/wardrobe/outfit"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="new/wardrobe/look"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="new/calendarEvent"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="view/wardrobe/looks/[lookId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="view/wardrobe/items/[itemId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="view/wardrobe/outfits/[outfitId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="view/wardrobe/outfitsGridView"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="view/calendarEvents/[calendarEventId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="view/profiles/[profileId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings/editProfile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="social/community"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
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
