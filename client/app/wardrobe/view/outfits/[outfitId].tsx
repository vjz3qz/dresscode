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
  Image,
} from "react-native";
import { Icon } from "@rneui/themed";
import { useLocalSearchParams } from "expo-router";
import { Outfit } from "@/types";
import { fetchOutfitById } from "@/api/fetchOutfits";
import { useSession } from "@/contexts/SessionContext";
import { fetchImageUrl } from "@/api/FetchImageUrl";
import { router } from "expo-router";

const { height, width } = Dimensions.get("window");

export default function OutfitView() {
  const { session } = useSession();
  const { outfitId } = useLocalSearchParams();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOutfit = async () => {
      setLoading(true);
      try {
        let fetchedOutfit = await fetchOutfitById(
          Array.isArray(outfitId) ? outfitId[0] : outfitId
        );
        // get outfit image url
        if (!fetchedOutfit.s3_key) return;
        if (!session) return;
        fetchedOutfit.image_url = await fetchImageUrl(
          fetchedOutfit.s3_key || "",
          session
        );
        setOutfit(fetchedOutfit);
      } catch (error: any) {
        console.error("Error fetching outfit:", error.message);
        setOutfit(null);
      } finally {
        setLoading(false);
      }
    };

    loadOutfit();
  }, []);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this outfit: ${outfit?.name || "Outfit"}`,
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon type="ionicon" name="send" color="black" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Icon
          type="ionicon"
          name="eye-outline"
          color="gray"
          size={24}
          style={styles.eyeIcon}
        />
        <Icon
          type="ionicon"
          name="heart-outline"
          color="gray"
          size={24}
          style={styles.heartIcon}
        />
        {outfit && (
          <Image
            source={{ uri: outfit.image_url }}
            style={styles.outfitImage}
          />
        )}
      </View>

      <View style={styles.tabsContainer}>
        <Text style={[styles.tabText, styles.activeTab]}>About</Text>
        <Text style={styles.tabText}>Styling</Text>
        <Text style={styles.tabText}>Details</Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailTitle}>Category</Text>
        <Text style={styles.detailText}>Glasses &gt; Sunglasses</Text>
        <View style={styles.divider} />
        <Text style={styles.detailTitle}>Brand</Text>
        <Text style={styles.detailText}>Select a brand</Text>
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  closeIcon: {
    fontSize: 24,
    color: "black",
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  outfitImage: {
    width: width * 0.6,
    height: width * 0.6,
    resizeMode: "contain",
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
  },
  eyeIcon: {
    position: "absolute",
    top: 10,
    left: 10,
  },
  heartIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 16,
    color: "#6b7280",
  },
  activeTab: {
    color: "black",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "black",
    paddingBottom: 6,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  detailTitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "bold",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
