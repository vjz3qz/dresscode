import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { fetchImageUrl } from "@/api/FetchImageUrl";
import { Look, Outfit, TableTypes } from "@/types";
import { fetchLooks, fetchOutfitsByLook } from "@/api/FetchLooks";

const { height } = Dimensions.get("window");

export default function LookFeed({
  onLookClick,
  tableName,
}: {
  onLookClick: (look: Look, index: number) => void;
  tableName: keyof TableTypes;
}) {
  const [looks, setLooks] = useState<Look[]>([]);

  useEffect(() => {
    const loadLooks = async () => {
      try {
        const fetchedLooks = await fetchLooks();

        for (const look of fetchedLooks) {
          const outfits = await fetchOutfitsByLook((look.id || "").toString());
          look.outfits = outfits as Outfit[];
          // Add image_url to each outfit
          look.outfits.forEach((outfit) => {
            fetchImageUrl(outfit.s3_key || "").then((url) => {
              outfit.image_url = url;
            });
          });
        }

        setLooks(fetchedLooks);
      } catch (error: any) {
        console.error("Error fetching looks:", error.message);
        setLooks([]);
        return;
      }
    };

    loadLooks();
  }, [tableName]);

  const renderOutfitGrid = (outfits: Outfit[]) => {
    const firstFourOutfits = outfits.slice(0, 4); // Get up to the first 4 outfits

    // Split the outfits into two rows, each with two outfits
    const rows: Outfit[][] = [];
    for (let i = 0; i < 2; i += 1) {
      for (let j = 0; j < 2; j += 1) {
        if (!rows[i]) rows[i] = []; // Initialize the row if it doesn't exist
        rows[i].push({
          id: i + j + Math.floor(Math.random() * 1000),
          image_url: "",
        } as Outfit); // Placeholder outfit
      }
    }
    let k = 0;
    for (let i = 0; i < 2; i += 1) {
      for (let j = 0; j < 2; j += 1) {
        if (k >= firstFourOutfits.length) break; // Break if there are no more outfits
        rows[i][j] = firstFourOutfits[k]; // Replace the placeholder outfit with the actual outfit
        k += 1; // Move to the next outfit
      }
    }

    return (
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((outfit) =>
              outfit.image_url ? (
                <View key={outfit.id} style={styles.cell}>
                  <Image
                    source={{
                      uri: outfit.image_url,
                    }}
                    style={styles.gridImage}
                  />
                </View>
              ) : (
                <View
                  key={outfit.id}
                  style={[styles.cell, styles.placeholderCell]}
                />
              )
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {looks.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 20, color: "#6b7280" }}>
            No {tableName} found. Add some {tableName}!
          </Text>
        </View>
      ) : (
        looks.map((look, index) => (
          <TouchableOpacity
            key={look.id}
            style={styles.lookContainer}
            onPress={() => onLookClick(look, index)}
          >
            {renderOutfitGrid(look.outfits || [])}
            <View style={styles.textContainer}>
              <Text style={styles.lookTitle}>{look.name}</Text>
              <Text style={styles.lookDescription}>{look.description}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  lookContainer: {
    width: "50%",
    height: height / 4.35,
    borderWidth: 0.5,
    borderColor: "white",
    marginBottom: 60,
  },
  textContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  lookDescription: {
    fontSize: 14,
    marginBottom: 10,
    color: "#6b7280",
  },
  gridContainer: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cell: {
    flex: 1,
    alignItems: "center",
  },
  gridImage: {
    width: 107,
    height: 107,
    borderWidth: 0.5,
    borderColor: "white",
  },
  placeholderCell: {
    width: 107,
    height: 107,
    backgroundColor: "#e0e0e0",
    borderWidth: 0.5,
    borderColor: "white",
  },
});
