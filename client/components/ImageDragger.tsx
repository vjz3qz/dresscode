import React from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage from "@/components/DraggableImage"; // Import your component
import { Item } from "@/types";

export default function ImageDragger({ images }: { images: Item[] }) {
  return (
    <GestureHandlerRootView style={styles.container}>
      {images.map((image, index) => (
        <DraggableImage
          key={index}
          imageUri={image["image_url"] || ""}
          initialX={Math.random() * 200}
          initialY={Math.random() * 200}
          initialSize={100}
        />
      ))}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
