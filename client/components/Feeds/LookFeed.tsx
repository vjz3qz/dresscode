import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Dimensions, ScrollView } from "react-native";
import { Image } from "expo-image";
import { fetchAllImageUrls, fetchImageUrl } from "@/api/FetchImageUrl";
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
          // add image_url to each outfit
          look.outfits.forEach((outfit) => {
            fetchImageUrl(outfit.s3_key || "").then((url) => {
              outfit.image_url = url;
            });
          });
          console.log("LookFeed: outfits", outfits);
        }

        setLooks(fetchedLooks);
        // fetchedLooks = (await fetchAllImageUrls(tableName)) as Look[];
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

    return (
      <View style={styles.gridContainer}>
        {firstFourOutfits.map((outfit) => {
          return (
            <Image
              key={outfit.id}
              source={{ uri: outfit.image_url }}
              style={styles.gridImage}
            />
          );
        })}
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
          <View key={look.id} style={styles.lookContainer}>
            {renderOutfitGrid(look.outfits || [])}
            <Text style={styles.lookTitle}>{look.name}</Text>
            <Text style={styles.lookDescription}>{look.description}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  lookContainer: {
    marginBottom: 20,
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
    flexDirection: "row",
    justifyContent: "space-around",
  },
  gridImage: {
    width: "23%", // roughly 4 items in a row
    height: height / 10,
    borderWidth: 0.5,
    borderColor: "white",
  },
});
