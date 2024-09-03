import React from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DraggableImage from "@/components/DraggableImage"; // Import your component

export default function ImageDragger() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <DraggableImage
        imageUri="https://via.placeholder.com/150"
        initialX={50}
        initialY={100}
        initialSize={150}
      />
      <DraggableImage
        imageUri="https://via.placeholder.com/100"
        initialX={200}
        initialY={300}
        initialSize={100}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
