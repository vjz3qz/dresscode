import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { fetchAllImageUrls } from "@/api/FetchImageUrl";
import { Outfit, TableTypes } from "@/types";

const { height } = Dimensions.get("window");

export default function SelectFeed({
  tableName,
  onSelect,
}: {
  tableName: keyof TableTypes;
  onSelect: (selectedOutfits: Outfit[]) => void;
}) {
  const [data, setData] = useState<Outfit[]>([]);
  const [selectedOutfits, setSelectedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchOutfits = async () => {
      setLoading(true); // Start loading
      let items: Outfit[] = [];
      try {
        items = (await fetchAllImageUrls(tableName)) as Outfit[];
      } catch (error: any) {
        console.error("Error fetching items:", error.message);
        setData([]);
      } finally {
        setData(items);
        setLoading(false); // End loading
      }
    };

    fetchOutfits();
  }, [tableName]);

  const toggleSelection = (item: Outfit) => {
    const isSelected = selectedOutfits.some(
      (selected) => selected.id === item.id
    );
    const newSelectedOutfits = isSelected
      ? selectedOutfits.filter((selected) => selected.id !== item.id)
      : [...selectedOutfits, item];

    setSelectedOutfits(newSelectedOutfits);
    onSelect(newSelectedOutfits);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {data.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 20, color: "#6b7280" }}>
            No {tableName} found. Add some {tableName}!
          </Text>
        </View>
      ) : (
        data.map((item) => {
          const isSelected = selectedOutfits.some(
            (selected) => selected.id === item.id
          );
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleSelection(item)}
              style={[
                styles.imageContainer,
                isSelected && styles.selectedImageContainer,
              ]}
            >
              <Image source={{ uri: item.image_url }} style={styles.image} />
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  imageContainer: {
    width: "33.33333333333333333333333%",
    height: height / 7,
    borderWidth: 0.5,
    borderColor: "white",
  },
  selectedImageContainer: {
    borderColor: "blue", // Change border color to indicate selection
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
