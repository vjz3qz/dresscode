import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
} from "react-native";
import { CalendarEvent, Outfit } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import Feed from "@/components/Feeds/Feed";
import { theme } from "@/theme";
import { useSession } from "@/contexts/SessionContext";
import { saveCalendarEvent } from "@/api/SaveCalendarEvent";

export default function OutfitsFeedScreen() {
  const {
    fromCalendar,
    selectedDate,
  }: {
    fromCalendar: string;
    selectedDate: string;
  } = useLocalSearchParams();

  const { session } = useSession();

  async function onSelect(object: Outfit) {
    if (fromCalendar !== "true") {
      console.log("fromCalendar", fromCalendar);
      console.error("Invalid navigation"); // for now
      return;
    }
    // create cal event
    const outfitId: number = object.id ?? -1;
    if (outfitId === -1) {
      console.error("Invalid outfit id");
      return;
    }
    const userId: string = session?.user.id ?? "";
    if (userId === "") {
      console.error("Invalid user id");
      return;
    }
    const calendarEvent: CalendarEvent = {
      user_id: userId,
      outfit_id: outfitId,
      all_day: true, // always all day for now
      start_timestamp: selectedDate,
      // end_timestamp: selectedDate,
    };
    await saveCalendarEvent(calendarEvent);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outfit canvas</Text>
        <View style={{ width: 30 }} />
      </View>
      <View style={styles.feedContainer}>
        <Feed
          tableName="outfits"
          onClick={(object: Outfit) => {
            onSelect(object);
            router.dismiss();
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
