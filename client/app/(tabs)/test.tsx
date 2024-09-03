import React, { useRef } from "react";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import { Button, View, Text, TouchableOpacity } from "react-native";
import ComingSoonScreen from "@/components/ComingSoon";
import ImageDragger from "@/components/ImageDragger";
import { StyleSheet } from "react-native";

export default function TestScreen() {
  const sheetRef = useRef<BottomSheetMethods>(null);
  return (
    <View style={{ flex: 1 }}>
      {/* <ImageDragger /> */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => {
          sheetRef.current?.open();
          console.log("Open bottom sheet");
        }}
      >
        <Text style={styles.closeButtonText}>Open</Text>
      </TouchableOpacity>
      <ImageDragger />
      <BottomSheet ref={sheetRef}>
        <Text>
          The smart 😎, tiny 📦, and flexible 🎗 bottom sheet your app craves 🚀
        </Text>
      </BottomSheet>
    </View>
  );
  // return <ComingSoonScreen />;
}

const styles = StyleSheet.create({
  openButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
