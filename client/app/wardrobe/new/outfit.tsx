import React, { useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import { Button, View, Text, TouchableOpacity } from "react-native";
import ImageDragger from "@/components/ImageDragger";
import { StyleSheet } from "react-native";
import { fetchAllItemImageUrls } from "@/api/FetchImageUrl";
import { Item } from "@/types";

export default function NewOutfitScreen() {
  const [items, setItems] = useState<Item[]>([]);
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
        style={styles.openButton}
        onPress={() => {
          sheetRef.current?.open();
          console.log("Open bottom sheet");
        }}
      >
        <Text style={styles.closeButtonText}>Open</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          console.log("Close bottom sheet");
        }}
      >
        <Text style={styles.closeButtonText}>Save</Text>
      </TouchableOpacity>

      <ImageDragger images={items} />
      <BottomSheet ref={sheetRef}>
        <Text>
          The smart 😎, tiny 📦, and flexible 🎗 bottom sheet your app craves 🚀
        </Text>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  openButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  // top right corner
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
