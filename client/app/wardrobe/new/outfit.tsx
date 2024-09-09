import React, { useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { fetchAllItemImageUrls } from "@/api/FetchImageUrl";
import { Item } from "@/types";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage from "@/components/DraggableImage";
import Feed from "@/components/Feed";
import { router } from "expo-router";

export default function NewOutfitScreen() {
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  function save() {
    console.log("Save outfit");
    console.log(selectedItems);
    // saveOutfit(selectedItems);
    router.dismiss();
  }

  const updateImagePosition = (id: string, x: number, y: number) => {
    // find the image index by id and update the x and y values
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id.toString() === id ? { ...item, x, y } : item
      )
    );
  };

  const updateImageSize = (id: string, size: number) => {
    // find the image index by id and update the size value
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.id.toString() === id ? { ...item, size } : item
      )
    );
  };

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
        {selectedItems.map((image, index) => {
          return (
            <DraggableImage
              key={image.id}
              imageUri={image["image_url"] || ""}
              initialX={image.x}
              initialY={image.y}
              initialSize={image.size}
              // onPositionChange={(x, y) =>
              //   updateImagePosition(image.id.toString(), x, y)
              // }
              // onSizeChange={(size) =>
              //   updateImageSize(image.id.toString(), size)
              // }
            />
          );
        })}
      </GestureHandlerRootView>

      <BottomSheet ref={sheetRef}>
        <Feed
          onItemClick={(item: Item, index: number) => {
            item["x"] = Math.random() * 200;
            item["y"] = Math.random() * 200;
            item["size"] = 100;
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
