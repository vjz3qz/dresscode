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
  TextInput,
} from "react-native";
import { Icon } from "@rneui/themed";
import { useLocalSearchParams } from "expo-router";
import { Outfit } from "@/types";
import { fetchOutfitById } from "@/api/fetchOutfits";
import { useSession } from "@/contexts/SessionContext";
import { fetchImageUrl } from "@/api/FetchImageUrl";
import { supabase } from "@/utils/Supabase";
import { router } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import { ScrollView } from "react-native-gesture-handler";

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
          Number(Array.isArray(outfitId) ? outfitId[0] : outfitId)
        );
        if (!fetchedOutfit.s3_key || !session) return;
        fetchedOutfit.image_url = await fetchImageUrl(
          fetchedOutfit.s3_key || ""
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

  const handleSave = async () => {
    if (!outfit || session?.user.id !== outfit.user_id) return;
    let outfitToSave = { ...outfit };
    delete (outfitToSave as any).image_url;

    const { error } = await supabase
      .from("outfits")
      .update(outfitToSave)
      .eq("id", outfitToSave.id);

    if (error) {
      console.error("Error saving outfit:", error.message);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this outfit: ${outfit?.name || "Outfit"}`,
      });
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

  const isOwner = session?.user.id === outfit?.user_id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.dismiss()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }}>
          {isOwner && (
            <TouchableOpacity onPress={handleSave} style={styles.shareButton}>
              <Text style={{ fontSize: 16, color: "blue" }}>Save</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Icon type="ionicon" name="send" color="black" size={24} />
          </TouchableOpacity>
        </View>
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

      <ScrollView style={styles.detailsContainer}>
        {[
          { title: "Name", key: "name" },
          { title: "Description", key: "description" },
          { title: "Occasion", key: "occasion" },
          { title: "Style", key: "style" },
          { title: "Season", key: "season" },
        ].map((field) => (
          <View key={field.key}>
            <Text style={styles.detailTitle}>{field.title}</Text>
            <TextInput
              style={styles.detailTextInput}
              value={outfit ? (outfit as any)[field.key] || "" : ""}
              onChangeText={(text) =>
                isOwner &&
                setOutfit(outfit ? { ...outfit, [field.key]: text } : null)
              }
              editable={isOwner}
              placeholder={`Enter ${field.title.toLowerCase()}`}
              placeholderTextColor="#b0b0b0"
            />
            <View style={styles.divider} />
          </View>
        ))}

        {isOwner && (
          <>
            <Text>Public</Text>
            <TouchableOpacity
              onPress={() => {
                setOutfit(
                  outfit ? { ...outfit, is_public: !outfit.is_public } : null
                );
              }}
            >
              {outfit?.is_public ? (
                <Entypo name="lock-open" size={24} color="black" />
              ) : (
                <Entypo name="lock" size={24} color="black" />
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  detailTextInput: {
    fontSize: 16,
    color: "#000",
    paddingVertical: 4,
    paddingTop: 12,
    paddingHorizontal: 12,
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
