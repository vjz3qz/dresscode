import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import type { Outfit } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import GridView from "@/components/GridViews/GridView";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function OutfitsGridView() {
  const { fromCalendar } = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleOutfitClick = (outfit: Outfit) => {
    if (fromCalendar === "true") {
      // Navigate to event creation with outfit
      router.push({
        pathname: "/new/calendarEvent",
        params: {
          outfitId: outfit.id,
          outfitImage: outfit.image_url,
        },
      });
    } else {
      // Normal outfit view navigation
      router.push(`/view/wardrobe/outfits/${outfit.id}`);
    }
  };

  const headerTitle =
    fromCalendar === "true" ? "Select an Outfit" : "Your Outfits";

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          {/* Empty view for balance */}
          <View style={{ width: 40 }} />
        </View>

        {/* Description */}
        {fromCalendar === "true" && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>
              Select an outfit to add to your calendar event
            </Text>
          </View>
        )}

        {/* Grid View */}
        <View style={styles.gridContainer}>
          <GridView onClick={handleOutfitClick} tableName="outfits" />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE6E5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  descriptionContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  gridContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
});
