import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  TextInput,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addImageUrls } from "@/api/FetchImageUrl";
import { useLocalSearchParams, router, Href } from "expo-router";
import type { Look, Outfit } from "@/types";
import GridView from "@/components/GridViews/GridView";
import { fetchLookById, fetchOutfitsByLook } from "@/api/FetchLooks";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/utils/Supabase";
import { ScrollView } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

export default function LookView() {
  const { session } = useSession();
  const { lookId } = useLocalSearchParams();
  const [look, setLook] = useState<Look | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("outfits");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load look details
        const fetchedLook = await fetchLookById(
          Array.isArray(lookId) ? lookId[0] : lookId
        );
        setLook(fetchedLook);

        // Load outfits in this look
        const fetchedOutfits = await fetchOutfitsByLook(
          Array.isArray(lookId) ? lookId[0] : lookId
        );
        if (!session) return;
        const fetchedOutfitsWithImages = await addImageUrls(fetchedOutfits);
        setOutfits(fetchedOutfitsWithImages);
      } catch (error: any) {
        console.error("Error fetching look data:", error.message);
        Alert.alert("Error", "Failed to load look details. Please try again.");
      } finally {
        setLoading(false);

        // Start animations after loading
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
      }
    };

    loadData();
  }, [lookId, session]);

  const handleSave = async () => {
    if (!look || session?.user.id !== look.user_id) return;

    setSaving(true);
    try {
      const lookToSave = { ...look };
      delete (lookToSave as any).outfits;

      const { error } = await supabase
        .from("looks")
        .update(lookToSave)
        .eq("id", lookToSave.id);

      if (error) {
        console.error("Error saving look:", error.message);
        Alert.alert("Error", "Failed to save changes. Please try again.");
      } else {
        Alert.alert("Success", "Look updated successfully!");
      }
    } catch (error: any) {
      console.error("Error in save process:", error.message);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this look from dresscode: ${look?.name || "Look"}`,
      });
    } catch (error: any) {
      console.error("Error sharing:", error.message);
      Alert.alert("Error", "Failed to share this look. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading look details...</Text>
      </View>
    );
  }

  const isOwner = session?.user.id === look?.user_id;

  const renderOutfitsTab = () => (
    <View style={styles.outfitsContainer}>
      <Text style={styles.sectionTitle}>Outfits in this Look</Text>
      <Text style={styles.outfitCount}>{outfits.length} outfits</Text>

      <GridView
        // onClick={(item: Item, index: number) => setSelectedImageIndex(index)}
        onClick={(item: Outfit, index: number) =>
          router.push(`/view/wardrobe/outfits/${item.id}` as Href)
        }
        rawData={outfits}
        tableName={"outfits"}
      />
    </View>
  );

  const renderDetailsTab = () => (
    <ScrollView
      style={styles.detailsScrollView}
      showsVerticalScrollIndicator={false}
    >
      {(
        [
          { title: "Name", key: "name", icon: "text-outline" },
          {
            title: "Description",
            key: "description",
            icon: "document-text-outline",
          },
          { title: "Theme", key: "theme", icon: "color-palette-outline" },
          {
            title: "Inspiration",
            key: "inspiration_source",
            icon: "bulb-outline",
          },
        ] as const
      ).map((field) => (
        <View key={field.key} style={styles.detailItem}>
          <View style={styles.detailHeader}>
            <Ionicons
              name={field.icon}
              size={18}
              color="#666"
              style={styles.detailIcon}
            />
            <Text style={styles.detailTitle}>{field.title}</Text>
          </View>
          <TextInput
            style={[
              styles.detailTextInput,
              isOwner && styles.editableInput,
              field.key === "description" && styles.multilineInput,
            ]}
            value={look ? (look as any)[field.key] || "" : ""}
            onChangeText={(text) =>
              isOwner && setLook(look ? { ...look, [field.key]: text } : null)
            }
            editable={isOwner}
            placeholder={`Enter ${field.title.toLowerCase()}`}
            placeholderTextColor="#b0b0b0"
            multiline={field.key === "description"}
            numberOfLines={field.key === "description" ? 4 : 1}
          />
          <View style={styles.divider} />
        </View>
      ))}

      {look?.tags && look.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <View style={styles.detailHeader}>
            <Ionicons
              name="pricetags-outline"
              size={18}
              color="#666"
              style={styles.detailIcon}
            />
            <Text style={styles.detailTitle}>Tags</Text>
          </View>
          <View style={styles.tagsList}>
            {look.tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {isOwner && (
        <View style={styles.visibilityContainer}>
          <Text style={styles.visibilityTitle}>Look Visibility</Text>
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => {
              setLook(look ? { ...look, is_public: !look.is_public } : null);
            }}
          >
            <Text style={styles.visibilityText}>
              {look?.is_public
                ? "Public - Anyone can see this look"
                : "Private - Only you can see this look"}
            </Text>
            <Ionicons
              name={look?.is_public ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="#333"
            />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );

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
          <Text style={styles.headerTitle}>{look?.name || "Look Details"}</Text>
          <View style={styles.headerActions}>
            {isOwner && (
              <TouchableOpacity
                onPress={handleSave}
                style={styles.actionButton}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#333" />
                ) : (
                  <Ionicons name="save-outline" size={24} color="#333" />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Look Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="shirt-outline" size={22} color="#333" />
            <Text style={styles.statText}>{outfits.length} Outfits</Text>
          </View>
          {look?.favorite_count !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={22} color="#333" />
              <Text style={styles.statText}>
                {look.favorite_count ?? 0} Likes
              </Text>
            </View>
          )}
          {/* <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => {
              // Add favorite functionality here
              Alert.alert(
                "Coming Soon",
                "Favoriting looks will be available soon!"
              );
            }}
          >
            <Ionicons name="heart" size={18} color="white" />
            <Text style={styles.favoriteButtonText}>Favorite</Text>
          </TouchableOpacity> */}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {["outfits", "details"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "outfits" ? renderOutfitsTab() : renderDetailsTab()}
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
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  favoriteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#EAE6E5",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#333",
  },
  tabContent: {
    flex: 1,
  },
  outfitsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  outfitCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  detailsScrollView: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailItem: {
    marginBottom: 15,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  detailTextInput: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 5,
  },
  editableInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 5,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tagChip: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#333",
  },
  visibilityContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  visibilityToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
  },
  visibilityText: {
    fontSize: 14,
    color: "#333",
  },
  spacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAE6E5",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
});
