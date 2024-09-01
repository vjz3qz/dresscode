import Camera from "@/components/Camera";
import ComingSoonScreen from "@/components/ComingSoon";
import React, { useState } from "react";
import { Button, View, StyleSheet } from "react-native";

export default function WardrobeScreen() {
  const [cameraOpen, setCameraOpen] = useState(false);
  return cameraOpen ? (
    <Camera exitCamera={() => setCameraOpen(false)} />
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
