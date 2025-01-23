import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  Switch,
} from "react-native";
import { Outfit } from "@/types";
import { router } from "expo-router";
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
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  function onSelect(selectedOutfit: Outfit) {
    if (isMultiSelect) {
      setSelectedOutfits((prev) =>
        prev.some((outfit) => outfit.id === selectedOutfit.id)
          ? prev.filter((outfit) => outfit.id !== selectedOutfit.id)
          : [...prev, selectedOutfit]
      );
    } else {
      setSelectedOutfits([selectedOutfit]);
    }
  }

  async function save() {
    // Save the selected outfits to the calendar
    // if
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outfit canvas</Text>
        <Switch
          value={isMultiSelect}
          onValueChange={(value) => {
            setIsMultiSelect(value);
            setSelectedOutfits([]);
          }}
          thumbColor={isMultiSelect ? theme.colors.primary : "#ccc"}
          trackColor={{ false: "#e0e0e0", true: theme.colors.secondary }}
        />
      </View>
      <View style={styles.feedContainer}>
        <Feed
          tableName="outfits"
          onClick={(object: Outfit) => {
            console.log("Selected object", object);
            onSelect(object);
          }}
        />
      </View>
      <View style={styles.metadataContainer}>
        <Text style={styles.label}>
          {isMultiSelect ? "Selected Outfits:" : "Selected Outfit:"}
        </Text>
        <Text>{selectedOutfits.map((outfit) => outfit.name).join(", ")}</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#f8f8f8",
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
