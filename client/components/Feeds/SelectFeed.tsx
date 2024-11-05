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
import { useSession } from "@/contexts/SessionContext";

const { height, width } = Dimensions.get("window");

export default function SelectFeed({
  tableName,
  onSelect,
}: {
  tableName: keyof TableTypes;
  onSelect: (selectedOutfits: Outfit[]) => void;
}) {
  const { session } = useSession();
  const [data, setData] = useState<Outfit[]>([]);
  const [selectedOutfits, setSelectedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfits = async () => {
      setLoading(true);
      let items: Outfit[] = [];
      try {
        if (!session) {
          return;
        }
        items = (await fetchAllImageUrls(tableName, session)) as Outfit[];
      } catch (error: any) {
        console.error("Error fetching items:", error.message);
        setData([]);
      } finally {
        setData(items);
        setLoading(false);
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
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
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
    paddingVertical: 10,
  },
  imageContainer: {
    width: width / 3 - 10, // Divide width into 3 with spacing
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: "transparent", // Default border color
  },
  selectedImageContainer: {
    borderColor: "gray", // Change border color to indicate selection
  },
  image: {
    width: "100%",
    height: height / 6,
    resizeMode: "cover",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 20,
    color: "#6b7280",
  },
});
