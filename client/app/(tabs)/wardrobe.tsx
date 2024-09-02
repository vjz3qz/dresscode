import Camera from "@/components/Camera";
import ComingSoonScreen from "@/components/ComingSoon";
import React, { useState } from "react";
import { Button, View, StyleSheet } from "react-native";
import ImageViewer from "@/components/ImageViewer"; // Add this import

export default function WardrobeScreen() {
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [imageName, setImageName] = useState<string | null>(null);
  return cameraOpen ? (
    <Camera
      exitCamera={() => setCameraOpen(false)}
      setImageName={setImageName}
    />
  ) : imageName ? (
    <ImageViewer imageName={imageName} /> // Correct the conditional rendering syntax
  ) : (
    <View style={styles.container}>
      <Button
        onPress={() => setCameraOpen(true)}
        title="Open Camera"
        color="#841584"
        accessibilityLabel="Open Camera"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
