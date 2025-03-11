import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useCallback } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { SessionProvider, useSession } from "@/contexts/SessionContext"; // Import your session context
import { StatusBar, View } from "react-native";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session, loading, profileNotFound } = useSession();
  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded && !loading) {
      setAppReady(true);
    }
  }, [fontsLoaded, loading]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  // Prevent rendering anything while waiting for fonts and auth state
  if (!appReady) {
    return null; // Keeps the splash screen visible
  }

  // Redirect logic after splash screen hides

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
      {/* Wrap Stack in a View and use onLayout here */}
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
      </View>
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
