import React, { useRef, useState } from "react";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { Item } from "@/types";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage, { DraggableImageRef } from "@/components/DraggableImage";
import Feed from "@/components/Feed";
import { router } from "expo-router";
import { saveOutfit } from "@/api/SaveOutfit";

export default function NewOutfitScreen() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const imageRefs = useRef<(DraggableImageRef | null)[]>([]); // Array of refs for DraggableImage components

  async function save() {
    const updatedItems = selectedItems.map((item, index) => {
      const ref = imageRefs.current[index];
      if (ref) {
        const { x, y, size } = ref.getPositionAndSize();
        return { ...item, x, y, size };
      }
      return item;
    });

    console.log("Save outfit", updatedItems);
    await saveOutfit({
      name: "New Outfit",
      metadata: updatedItems,
    }); // Call your API or data persistence method here
    router.dismiss();
  }

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
        {selectedItems.map((item, index) => (
          <DraggableImage
            key={item.id}
            ref={(ref) => (imageRefs.current[index] = ref)} // Store refs
            imageUri={item.image_url || ""}
            initialX={item.x}
            initialY={item.y}
            initialSize={item.size}
          />
        ))}
      </GestureHandlerRootView>

      <BottomSheet ref={sheetRef}>
        <Feed
          onItemClick={(item: Item) => {
            // Assign initial random positions and size for the newly selected item
            item.x = Math.random() * 200;
            item.y = Math.random() * 200;
            item.size = 100;
            setSelectedItems([...selectedItems, item]);
            sheetRef.current?.close();
          }}
          tableName={"items"}
        />
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
