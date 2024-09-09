import React, { useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import { Button, View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { fetchAllItemImageUrls } from "@/api/FetchImageUrl";
import { Item } from "@/types";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage from "@/components/DraggableImage";

export default function NewOutfitScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [imagePositions, setImagePositions] = React.useState<
    {
      x: number;
      y: number;
      size: number;
      id: string;
    }[]
  >([]);
  function save() {
    console.log("Save outfit");
    console.log(imagePositions);
  }

  useEffect(() => {
    const newImagePositions = items.map((image) => ({
      x: Math.random() * 200,
      y: Math.random() * 200,
      size: 100,
      id: image["id"].toString(), // Convert the id to a string
    }));

    setImagePositions(newImagePositions);
  }, [items]); // Recalculate whenever `items` changes
  useEffect(() => {
    async function fetchAllItems() {
      const fetchedItems = await fetchAllItemImageUrls("items");
      setItems(fetchedItems);
    }
    fetchAllItems();
  }, []);

  const sheetRef = useRef<BottomSheetMethods>(null);
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          sheetRef.current?.open();
          console.log("Open bottom sheet");
        }}
      >
        <Text style={styles.buttonText}>Add Item</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      <GestureHandlerRootView style={{ flex: 1 }}>
        {items.map((image, index) => {
          const position = imagePositions[index];
          // Add defensive check
          if (!position) {
            return null; // Or handle error case
          }
          return (
            <DraggableImage
              key={index}
              imageUri={image["image_url"] || ""}
              initialX={position.x}
              initialY={position.y}
              initialSize={position.size}
            />
          );
        })}
      </GestureHandlerRootView>
      <BottomSheet ref={sheetRef}>
        <Text>
          The smart 😎, tiny 📦, and flexible 🎗 bottom sheet your app craves 🚀
        </Text>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  // top right corner
  saveButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
