import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import React, { useRef, useState, useEffect } from "react";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { StyleSheet } from "react-native";
import { Item } from "@/types";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage, { DraggableImageRef } from "@/components/DraggableImage";
import GridView from "@/components/GridViews/GridView";
import { router, useLocalSearchParams } from "expo-router";
import { saveOutfit } from "@/api/SaveOutfit";

export default function NewOutfitScreen() {
  const { fromCalendar, selectedDate } = useLocalSearchParams(); // TODO: add to specified date after creating outfits
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const imageRefs = useRef<(DraggableImageRef | null)[]>([]); // Array of refs for DraggableImage components
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const viewRef = useRef(null); // Reference for capturing the entire outfit view
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  if (status === null) {
    requestPermission();
  }

  async function save() {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
          disabled={loading}
        >
          <Text style={styles.icon}>⏪</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={save}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setSelectedItems(selectedItems.slice(0, -1));
            imageRefs.current = imageRefs.current.slice(0, -1);
          }}
          disabled={loading}
        >
          <Text style={styles.icon}>↩️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.bottomSheetButton}
        onPress={() => sheetRef.current?.open()}
        disabled={loading}
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
        <GridView
          onClick={(item: Item) => {
            item.x = Math.random() * 200;
            item.y = Math.random() * 200;
            item.size = 100;
            setSelectedItems([...selectedItems, item]);
            sheetRef.current?.close();
          }}
          tableName={"items"}
        />
      </BottomSheet>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
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
  disabledButton: {
    opacity: 0.6,
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
