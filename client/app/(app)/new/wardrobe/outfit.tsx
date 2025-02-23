import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import React, { useRef, useState, useEffect } from "react";
import BottomSheet, { type BottomSheetMethods } from "@devvie/bottom-sheet";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import { StyleSheet } from "react-native";
import type {
  ExtendedItem,
  Item,
  SelectedItem,
  SuggestedOutfit,
} from "@/types";
import DraggableImage, {
  type DraggableImageRef,
} from "@/components/DraggableImage";
import GridView from "@/components/GridViews/GridView";
import { router, useLocalSearchParams } from "expo-router";
import { saveOutfit } from "@/api/SaveOutfit";
import {
  getSuggestedOutfits,
  queueSuggestedOutfitJob,
} from "@/api/suggestOutfits";
import { fetchItemById } from "@/api/fetchItems";
import Modal from "@/ui/Modal";
import { addImageUrls } from "@/api/FetchImageUrl";

const { height, width } = Dimensions.get("window");

export default function NewOutfitScreen() {
  const { fromCalendar, selectedDate } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ExtendedItem[]>([]);
  const [suggestedOutfits, setSuggestedOutfits] = useState<SuggestedOutfit[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<"queue" | "ready">("queue");
  const imageRefs = useRef<(DraggableImageRef | null)[]>([]);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const viewRef = useRef(null);
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

    fetchStyleSuggestions();
  }, [fadeAnim]);

  const fetchStyleSuggestions = async () => {
    try {
      const suggestions = await getSuggestedOutfits(["queued", "ready"]);
      const suggestionsWithItems = await Promise.all(
        // for each suggestion fetch all items
        suggestions.map(async (suggestedOutfit: SuggestedOutfit) => {
          if (!suggestedOutfit.selected_items) return suggestedOutfit;
          // fetch all items
          const items = await Promise.all(
            (suggestedOutfit.selected_items as SelectedItem[]).map(
              async (item: SelectedItem): Promise<ExtendedItem> => {
                const fetchedItem: Item = await fetchItemById(
                  item.id.toString()
                );
                return { ...fetchedItem, reason: item.reason } as ExtendedItem;
              }
            )
          );
          // get images
          const itemsWithImages = await addImageUrls(items);
          // map the fetched items back
          return { ...suggestedOutfit, items: itemsWithImages };
        })
      );
      setSuggestedOutfits(suggestionsWithItems);
    } catch (error) {
      console.error("Error fetching style suggestions:", error);
    }
  };

  if (status === null) {
    requestPermission();
  }

  async function save() {
    setLoading(true);

    try {
      // Ensure the viewRef is correctly set
      if (!viewRef.current) {
        console.error("View reference is null");
        setLoading(false);
        return;
      }

      // Capture metadata for draggable images
      const updatedItems = selectedItems.map((item, index) => {
        const ref = imageRefs.current[index];
        if (ref) {
          const { x, y, size } = ref.getPositionAndSize();
          return { ...item, x, y, size };
        }
        return item;
      });

      // Capture the screenshot of the outfit canvas
      const screenshotUri = await captureRef(viewRef, {
        result: "tmpfile",
        format: "png",
        quality: 1,
      });

      console.log("Screenshot captured at:", screenshotUri);

      // Save screenshot to media library
      await MediaLibrary.saveToLibraryAsync(screenshotUri);
      console.log("Screenshot saved successfully!");

      // Save outfit with metadata and screenshot
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

  const addSuggestedItem = (item: ExtendedItem) => {
    item.x = Math.random() * 200;
    item.y = Math.random() * 200;
    item.size = 100;
    setSelectedItems([...selectedItems, item]);
  };

  function QueueTab() {
    const [occasion, setOccasion] = useState("");
    const [isQueueing, setIsQueueing] = useState(false);

    const queueNewSuggestion = async () => {
      if (occasion) {
        try {
          setIsQueueing(true);
          const queuedOccasion = occasion;
          setOccasion("");
          await queueSuggestedOutfitJob(queuedOccasion);
          await fetchStyleSuggestions();
        } catch (error) {
          console.error("Error queueing suggestion:", error);
        } finally {
          setIsQueueing(false);
        }
      }
    };

    return (
      <ScrollView>
        <Text style={styles.suggestionsTitle}>Queue New Suggestion</Text>
        <View style={styles.queueContainer}>
          <Text style={styles.label}>Occasion</Text>
          <TextInput
            style={styles.occasionInput}
            value={occasion}
            onChangeText={setOccasion}
            placeholder="Describe the occasion..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={styles.queueButtonContainer}>
            <TouchableOpacity
              style={[
                styles.queueButton,
                (!occasion || isQueueing) && styles.disabledButton,
              ]}
              onPress={queueNewSuggestion}
              disabled={!occasion || isQueueing}
            >
              <Text style={styles.queueButtonText}>
                {isQueueing ? "Queueing..." : "Queue Suggestion"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {suggestedOutfits.filter(
          (suggestedOutfit) => suggestedOutfit.status === "queued"
        ).length > 0 && (
          <Text style={styles.suggestionsTitle}>Queued Suggestions</Text>
        )}
        {suggestedOutfits
          .filter((suggestedOutfit) => suggestedOutfit.status === "queued")
          .map((suggestedOutfit) => (
            <View key={suggestedOutfit.id} style={styles.suggestionItem}>
              <Text style={styles.itemName}>
                Occasion: {suggestedOutfit.occasion}
              </Text>
              <Text style={styles.itemStatus}>
                Status: {suggestedOutfit.status}
              </Text>
            </View>
          ))}
      </ScrollView>
    );
  }

  function ReadyTab() {
    return (
      <ScrollView>
        <Text style={styles.suggestionsTitle}>Ready Suggestions</Text>
        {suggestedOutfits
          .filter((outfit) => outfit.status === "ready")
          .map((suggestedOutfit) => (
            <View key={suggestedOutfit.id} style={styles.suggestionItem}>
              <Text style={styles.itemName}>
                Occasion: {suggestedOutfit.occasion}
              </Text>
              <Text style={styles.notesTitle}>Stylist Notes</Text>
              <Text style={styles.notes}>{suggestedOutfit.notes}</Text>
              {suggestedOutfit.items &&
                suggestedOutfit.items.map((item: ExtendedItem) => (
                  <View key={item.id} style={styles.selectedItemContainer}>
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.itemImage}
                    />
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemReason}>{item.reason}</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addSuggestedItem(item)}
                    >
                      <Text style={styles.addButtonText}>Add to Outfit</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </View>
          ))}
      </ScrollView>
    );
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

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        transparent
      >
        <View style={styles.modalContent}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "queue" && styles.activeTab]}
              onPress={() => setActiveTab("queue")}
            >
              <Text style={styles.tabText}>Queue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "ready" && styles.activeTab]}
              onPress={() => setActiveTab("ready")}
            >
              <Text style={styles.tabText}>Ready</Text>
            </TouchableOpacity>
          </View>
          {activeTab === "queue" ? <QueueTab /> : <ReadyTab />}
        </View>
      </Modal>
      <View style={styles.canvasContainer} ref={viewRef} collapsable={false}>
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

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setModalVisible(true);
          }}
          disabled={loading}
        >
          <Text style={styles.icon}>🤖</Text>
        </TouchableOpacity>
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
          onClick={(item: ExtendedItem) => {
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
  suggestionsContainer: {
    maxHeight: height * 0.7,
    maxWidth: width * 0.7,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  suggestionItem: {
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemReason: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "#B0C4DE",
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  notes: {
    fontSize: 14,
    color: "#333",
  },
  itemImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: "contain",
    backgroundColor: "#ccdcf0",
    borderRadius: 20,
  },
  queueContainer: {
    marginBottom: 20,
    flexDirection: "column", // Ensure items are stacked vertically
    gap: 10, // Adds vertical spacing between children
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  occasionInput: {
    flex: 1,
    height: 120,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    marginBottom: 16,
  },
  queueButtonContainer: {
    alignSelf: "flex-start",
  },
  queueButton: {
    backgroundColor: "#4A90E2",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  queueButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#B0C4DE",
    shadowOpacity: 0,
    elevation: 0,
  },
  selectedItemContainer: {
    marginTop: 10,
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    height: height * 0.7,
    width: width * 0.7,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "black",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemStatus: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
