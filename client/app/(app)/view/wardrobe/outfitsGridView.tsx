import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
} from "react-native";
import { Outfit } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import GridView from "@/components/GridViews/GridView";
import { theme } from "@/theme";

export default function OutfitsGridView() {
  const { fromCalendar } = useLocalSearchParams();

  const handleOutfitClick = (outfit: Outfit) => {
    if (fromCalendar === "true") {
      // Navigate to event creation with outfit
      router.push({
        pathname: "/new/calendarEvent",
        params: {
          outfitId: outfit.id,
          outfitImage: outfit.image_url,
        },
      });
    } else {
      // Normal outfit view navigation
      router.push(`/view/wardrobe/outfits/${outfit.id}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outfit canvas</Text>
        <View style={{ width: 30 }} />
      </View>
      <View style={styles.feedContainer}>
        <GridView onClick={handleOutfitClick} tableName="outfits" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  iconButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  feedContainer: {
    flex: 1,
    paddingTop: 20,
  },
  metadataContainer: {
    padding: 16,
  },
  label: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 20,
  },
  input: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
});
