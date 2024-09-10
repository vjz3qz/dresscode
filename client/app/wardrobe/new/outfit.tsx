import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
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
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const viewRef = useRef(null); // Reference for capturing the entire outfit view

  if (status === null) {
    requestPermission();
  }

  async function save() {
    // Capture metadata first
    const updatedItems = selectedItems.map((item, index) => {
      const ref = imageRefs.current[index];
      if (ref) {
        const { x, y, size } = ref.getPositionAndSize();
        return { ...item, x, y, size };
      }
      return item;
    });

    // Capture the screenshot
    try {
      const screenshotUri = await captureRef(viewRef, {
        height: 800, // Customize based on your view size
        quality: 1,
      });

      // Save screenshot to media library
      await MediaLibrary.saveToLibraryAsync(screenshotUri);
      console.log("Screenshot saved:", screenshotUri);

      // Save both metadata and screenshot URI
      await saveOutfit(
        {
          name: "New Outfit",
          metadata: updatedItems,
        },
        screenshotUri
      );

      router.dismiss();
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  }

  const sheetRef = useRef<BottomSheetMethods>(null);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => sheetRef.current?.open()}
      >
        <Text style={styles.buttonText}>Add Item</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      {/* Wrap the entire view you want to screenshot in a View with a ref */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, height: "100%" }} ref={viewRef}>
          {selectedItems.map((item, index) => (
            <DraggableImage
              key={item.id}
              ref={(ref) => (imageRefs.current[index] = ref)}
              imageUri={item.image_url || ""}
              initialX={item.x}
              initialY={item.y}
              initialSize={item.size}
            />
          ))}
        </View>
      </GestureHandlerRootView>

      <BottomSheet ref={sheetRef}>
        <Feed
          onItemClick={(item: Item) => {
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
