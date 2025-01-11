import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { Look, Outfit } from "@/types";
import SelectFeed from "@/components/Feeds/SelectFeed";
import { router } from "expo-router";
import { saveLook } from "@/api/SaveLook";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import Feed from "@/components/Feeds/Feed";
import { theme } from "@/theme";

export default function OutfitsFeedScreen({
  fromCalendar,
  selectedDate,
}: {
  fromCalendar: string;
  selectedDate: string;
}) {
  const [selectedOutfits, setSelectedOutfits] = useState<Outfit[]>([]);
  const [metadata, setMetadata] = useState({
    name: "New Look",
    description: "A new look",
  });
  const sheetRef = useRef<BottomSheetMethods>(null);

  function onSelect(selectedOutfits: Outfit[]) {
    setSelectedOutfits(selectedOutfits);
  }

  async function save() {
    const newLook: Look = {
      name: metadata.name,
      description: metadata.description,
    };
    await saveLook(newLook, selectedOutfits);
    router.dismiss();
  }

  function toggleView() {
    // setShowMetadataForm(!showMetadataForm);() => sheetRef.current?.open()
    sheetRef.current?.open();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={save} style={styles.iconButton}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View> */}
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.dismiss()}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Outfit canvas</Text>
          <View style={{ width: 30 }} />
        </View>
      </View>
      <View style={styles.feedContainer}>
        <Feed
          tableName="outfits"
          onClick={(object: any, index: number) => {
            console.log("object", object);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  iconButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  feedContainer: {
    flex: 1,
    paddingTop: 20,
  },
  metadataContainer: {
    padding: 16,
  },
  label: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 20,
  },
  input: {
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
});
