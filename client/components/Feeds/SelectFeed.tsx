import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { fetchAllItemImageUrls } from "@/api/FetchImageUrl";
import { Item } from "@/types";

const { height } = Dimensions.get("window");

export default function SelectFeed({
  tableName,
  onSelect,
}: {
  tableName: string;
  onSelect: (selectedItems: Item[]) => void;
}) {
  const [data, setData] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      let items: Item[] = [];
      try {
        items = await fetchAllItemImageUrls(tableName);
      } catch (error: any) {
        console.error("Error fetching items:", error.message);
        setData([]);
        return;
      }
      setData(items);
    };

    fetchItems();
  }, [tableName]);

  const toggleSelection = (item: Item) => {
    const isSelected = selectedItems.some(
      (selected) => selected.id === item.id
    );
    const newSelectedItems = isSelected
      ? selectedItems.filter((selected) => selected.id !== item.id)
      : [...selectedItems, item];

    setSelectedItems(newSelectedItems);
    onSelect(newSelectedItems);
  };

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
          const isSelected = selectedItems.some(
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
});
