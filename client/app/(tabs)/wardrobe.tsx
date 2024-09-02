import UploadButton from "@/ui/UploadButton";
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import Camera from "@/components/Camera";
import ImageViewer from "@/components/ImageViewer";

const tabs = [{ name: "Items" }, { name: "Outfits" }, { name: "Looks" }];

export default function WardrobeScreen() {
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [imageName, setImageName] = useState<string | null>(null);
  const [value, setValue] = useState(0);

  return cameraOpen ? (
    <Camera
      exitCamera={() => setCameraOpen(false)}
      setImageName={setImageName}
    />
  ) : imageName ? (
    <ImageViewer imageName={imageName} />
  ) : (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {tabs.map((item, index) => {
          const isActive = index === value;

          return (
            <View key={item.name} style={{ flex: 1 }}>
              <TouchableWithoutFeedback
                onPress={() => {
                  setValue(index);
                }}
              >
                <View
                  style={[
                    styles.item,
                    isActive && { backgroundColor: "#e0e7ff" },
                  ]}
                >
                  <Text style={[styles.text, isActive && { color: "#4338ca" }]}>
                    {item.name}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          );
        })}
      </View>
      <UploadButton onPress={() => setCameraOpen(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 24,
    paddingHorizontal: 12,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
});
