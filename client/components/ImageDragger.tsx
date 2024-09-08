import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage from "@/components/DraggableImage"; // Import your component
import { Item } from "@/types";

export default function ImageDragger({ images }: { images: Item[] }) {
  const [imagePositions, setImagePositions] = React.useState<
    {
      x: number;
      y: number;
      size: number;
      id: string;
    }[]
  >([]);

  useEffect(() => {
    const newImagePositions = images.map((image) => ({
      x: Math.random() * 200,
      y: Math.random() * 200,
      size: 100,
      id: image["id"].toString(), // Convert the id to a string
    }));

    setImagePositions(newImagePositions);
  }, [images]); // Recalculate whenever `images` changes

  function save() {
    console.log("Save outfit");
    console.log(imagePositions);
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {images.map((image, index) => {
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
