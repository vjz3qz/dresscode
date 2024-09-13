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

    // Split the outfits into two rows, each with two outfits
    const rows = [];
    for (let i = 0; i < firstFourOutfits.length; i += 2) {
      rows.push(firstFourOutfits.slice(i, i + 2));
    }

    return (
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((outfit) => (
              <View key={outfit.id} style={styles.cell}>
                <Image
                  source={{
                    uri: outfit.image_url,
                  }}
                  style={styles.gridImage}
                />
              </View>
            ))}
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
          <View key={look.id} style={styles.lookContainer}>
            {renderOutfitGrid(look.outfits || [])}
            <View style={styles.textContainer}>
              <Text style={styles.lookTitle}>{look.name}</Text>
              <Text style={styles.lookDescription}>{look.description}</Text>
            </View>
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
    flexDirection: "column", // Ensures the grid has rows
  },
  row: {
    flexDirection: "row", // Each row has items aligned horizontally
    justifyContent: "center", // Spacing between the items
    // marginBottom: 10, // Add some space between rows
  },
  cell: {
    flex: 1, // Makes each cell take equal space
    // marginRight: 10, // Add space between cells
    alignItems: "center", // Center the image horizontally in the cell
  },
  gridImage: {
    width: 107, // Set appropriate width for the image
    height: 107, // Set appropriate height for the image

    borderWidth: 0.5,
    borderColor: "white",
  },
});
