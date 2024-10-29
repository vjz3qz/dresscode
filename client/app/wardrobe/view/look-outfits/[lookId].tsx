import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Gallery from "react-native-awesome-gallery";
import { addImageUrls } from "@/api/FetchImageUrl";
import { useLocalSearchParams } from "expo-router";
import { Item, Look, Outfit } from "@/types";
import Feed from "@/components/Feeds/Feed";
import { fetchLookById, fetchOutfitsByLook } from "@/api/FetchLooks";
import { useSession } from "@/contexts/SessionContext";

const { height } = Dimensions.get("window");

export default function LookOutfits() {
  const { session } = useSession();
  const { lookId } = useLocalSearchParams();
  const [look, setLook] = useState<Look | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const loadLook = async () => {
      setLoading(true); // Start loading
      try {
        const fetchedLook = await fetchLookById(
          Array.isArray(lookId) ? lookId[0] : lookId
        );
        setLook(fetchedLook);
      } catch (error: any) {
        console.error("Error fetching look:", error.message);
        setLook(null);
      }
    };

    const loadOutfits = async () => {
      try {
        const fetchedOutfits = await fetchOutfitsByLook(
          Array.isArray(lookId) ? lookId[0] : lookId
        );
        if (!session) return;
        const fetchedOutfitsWithImages = await addImageUrls(
          fetchedOutfits,
          session
        );
        setOutfits(fetchedOutfitsWithImages);
      } catch (error: any) {
        console.error("Error fetching outfits:", error.message);
        setOutfits([]);
      } finally {
        setLoading(false); // End loading after data is fetched
      }
    };

    loadLook();
    loadOutfits();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

  if (selectedImageIndex !== null) {
    return (
      <View style={{ flex: 1 }}>
        {/* X button to close the gallery */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setSelectedImageIndex(null);
          }}
        >
          <Text style={styles.closeButtonText}>x</Text>
        </TouchableOpacity>
        <Gallery
          initialIndex={selectedImageIndex}
          data={outfits.map((object) => object.image_url)}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Feed
        onObjectClick={(item: Item, index: number) => {
          setSelectedImageIndex(index);
        }}
        rawData={outfits}
        tableName={"outfits"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 24,
    paddingHorizontal: 12,
    justifyContent: "space-around",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 6,
    width: 100, // Fixed width for each tab
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  debugBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  scrollContainer: {
    flexGrow: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: "33.33333333333333333333333%",
    height: height / 7,
    borderWidth: 0.5,
    borderColor: "white",
  },
  closeButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
