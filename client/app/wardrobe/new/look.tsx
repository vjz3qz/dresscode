import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Look, Outfit } from "@/types";
import SelectFeed from "@/components/Feeds/SelectFeed";
import { router } from "expo-router";
import { saveLook } from "@/api/SaveLook";

export default function NewLookScreen() {
  const [selectedOutfits, setSelectedOutfits] = useState<Outfit[]>([]);

  function onSelect(selectedOutfits: Outfit[]) {
    setSelectedOutfits(selectedOutfits);
  }
  async function save() {
    console.log("Saving look with outfits:", selectedOutfits);
    const newLook: Look = {
      name: "New Look",
      description: "A new look",
    };
    await saveLook(newLook, selectedOutfits);
    router.dismiss();
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.saveButton} onPress={save}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      <View style={styles.feedContainer}>
        <SelectFeed tableName="outfits" onSelect={onSelect} />
      </View>
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
  feedContainer: {
    flex: 1,
    paddingTop: 100, // Add padding above the SelectFeed
  },
});
