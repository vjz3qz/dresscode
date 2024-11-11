import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import React, { useRef, useState } from "react";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { Item } from "@/types";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage, { DraggableImageRef } from "@/components/DraggableImage";
import Feed from "@/components/Feeds/Feed";
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
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outfit canvas</Text>
        <View style={{ width: 30 }} />
      </View>

      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.canvasContainer} ref={viewRef}>
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

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setSelectedItems([]);
            imageRefs.current = [];
          }}
        >
          <Text style={styles.icon}>⏪</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={save}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setSelectedItems(selectedItems.slice(0, -1));
            imageRefs.current = imageRefs.current.slice(0, -1);
          }}
        >
          <Text style={styles.icon}>↩️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.bottomSheetButton}
        onPress={() => sheetRef.current?.open()}
      >
        <Text style={styles.bottomSheetButtonText}>Add Items</Text>
      </TouchableOpacity>

      <BottomSheet
        ref={sheetRef}
        style={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Feed
          onObjectClick={(item: Item) => {
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  closeIcon: {
    fontSize: 24,
    color: "black",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  icon: {
    fontSize: 24,
    color: "black",
  },
  saveButton: {
    backgroundColor: "#d3d3d3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  saveButtonText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "bold",
  },
  bottomSheetButton: {
    backgroundColor: "black",
    paddingVertical: 30,
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
