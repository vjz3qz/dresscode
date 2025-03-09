import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { SessionProvider, useSession } from "@/contexts/SessionContext"; // Import your session context
import { ActivityIndicator, View, Image, StatusBar } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session, loading, profileNotFound } = useSession(); // Add loading here

  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
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
          source={require("../../assets/images/logo.png")}
          style={{
            width: 390,
            height: 575,
            resizeMode: "contain",
          }}
        />
      </View>
    );
  }

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
