import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import Gallery from "react-native-awesome-gallery";
import { addImageUrls } from "@/api/FetchImageUrl";
import { useLocalSearchParams } from "expo-router";
import { Item, Look, Outfit } from "@/types";
import Feed from "@/components/Feeds/Feed";
import { fetchLookById, fetchOutfitsByLook } from "@/api/FetchLooks";
import { useSession } from "@/contexts/SessionContext";
import { Icon } from "@rneui/themed";

const { height } = Dimensions.get("window");

export default function LookView() {
  const { session } = useSession();
  const { lookId } = useLocalSearchParams();
  const [look, setLook] = useState<Look | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLook = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };

    loadLook();
    loadOutfits();
  }, []);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this look: ${look?.name || "Look"}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type:", result.activityType);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error: any) {
      console.error("Error sharing:", error.message);
    }
  };

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
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {look ? look.name : "Look"} Outfits
        </Text>
        {/* <IoSend /> */}
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon type="ionicon" name="send" />
        </TouchableOpacity>
      </View>

      <Feed
        onClick={(item: Item, index: number) => {
          setSelectedImageIndex(index);
        }}
        rawData={outfits}
        tableName={"outfits"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 20,
    color: "#6b7280",
  },
  shareButton: {
    padding: 8,
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
