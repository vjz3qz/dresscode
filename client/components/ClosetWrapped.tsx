import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Look, Item, Outfit } from "@/types";

interface WrappedStats {
  mostWornOutfit: Outfit | null;
  mostWornItem: Item | null;
  dominantColors: string[];
  styleVibe: string;
  description: string;
}

interface ClosetWrappedProps {
  stats: WrappedStats;
}

export default function ClosetWrapped({ stats }: ClosetWrappedProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Closet Wrapped</Text>
      <Text style={styles.subtitle}>This Week's Style Story</Text>

      <View style={styles.vibeContainer}>
        <Text style={styles.vibeText}>"{stats.description}"</Text>
      </View>

      {stats.mostWornOutfit && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Worn Outfit</Text>
          <Image
            source={{ uri: stats.mostWornOutfit.image_url }}
            style={styles.outfitImage}
          />
        </View>
      )}

      {stats.mostWornItem && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Worn Item</Text>
          <Image
            source={{ uri: stats.mostWornItem.image_url }}
            style={styles.itemImage}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Color Palette</Text>
        <View style={styles.colorContainer}>
          {stats.dominantColors.map((color, index) => (
            <View
              key={index}
              style={[styles.colorBox, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  vibeContainer: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  vibeText: {
    fontSize: 20,
    fontStyle: "italic",
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  outfitImage: {
    width: "100%",
    height: 300,
    borderRadius: 15,
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  colorBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    margin: 5,
  },
});
