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
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import type { Item } from "@/types";
import { fetchItemById } from "@/api/fetchItems";
import { useSession } from "@/contexts/SessionContext";
import { fetchImageUrl } from "@/api/FetchImageUrl";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { supabase } from "@/utils/Supabase";
import * as FileSystem from "expo-file-system";

const { width } = Dimensions.get("window");

export default function ItemView() {
  const { session } = useSession();
  const { itemId } = useLocalSearchParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      try {
        const fetchedItem = await fetchItemById(
          Array.isArray(itemId) ? itemId[0] : itemId
        );
        if (!fetchedItem.s3_key) return;
        if (!session) return;
        fetchedItem.image_url = await fetchImageUrl(fetchedItem.s3_key || "");
        setItem(fetchedItem);
      } catch (error: any) {
        console.error("Error fetching item:", error.message);
        setItem(null);
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

    loadItem();
  }, [itemId, session]);

  async function handleSave() {
    if (!item || session?.user.id !== item.user_id) return;

    setSaving(true);
    try {
      const itemToSave = { ...item };
      delete (itemToSave as any).image_url;

      const { error } = await supabase
        .from("items")
        .update({
          ...itemToSave,
        })
        .eq("id", itemToSave.id);

      if (error) {
        console.error("Error saving item:", error.message);
        Alert.alert("Error", "Failed to save changes. Please try again.");
      } else {
        Alert.alert("Success", "Item updated successfully!");
      }
    } catch (error: any) {
      console.error("Error in save process:", error.message);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const handleShare = async () => {
    try {
      if (!item?.image_url) return;

      // Define local path for storing image
      const fileUri = `${FileSystem.cacheDirectory}shared-image.jpg`;

      // Download image
      const { uri } = await FileSystem.downloadAsync(item.image_url, fileUri);

      // Share the image
      const result = await Share.share({
        message: `Check out this item from dresscode: ${item?.name || "Item"}`,
        url: uri, // Share the locally stored image
      });
    } catch (error: any) {
      console.error("Error sharing:", error.message);
      Alert.alert("Error", "Failed to share this item. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  const isOwner = session?.user.id === item?.user_id;

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
          <Text style={styles.headerTitle}>{item?.name || "Item Details"}</Text>
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

        {/* Image Container */}
        <View style={styles.imageContainer}>
          {item && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.itemImage}
              contentFit="cover"
              transition={300}
            />
          )}

          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.imageActionButton}>
              <Ionicons name="heart-outline" size={22} color="#333" />
            </TouchableOpacity>
            {isOwner && (
              <TouchableOpacity
                style={styles.imageActionButton}
                onPress={() => {
                  setItem(
                    item ? { ...item, is_public: !item.is_public } : null
                  );
                }}
              >
                <Ionicons
                  name={
                    item?.is_public
                      ? "lock-open-outline"
                      : "lock-closed-outline"
                  }
                  size={22}
                  color="#333"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {["about", "styling", "details"].map((tab) => (
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

        {/* Details */}
        <ScrollView
          style={styles.detailsContainer}
          showsVerticalScrollIndicator={false}
        >
          {(
            [
              { title: "Name", key: "name", icon: "text-outline" },
              { title: "Type", key: "type", icon: "pricetag-outline" },
              { title: "Color", key: "color", icon: "color-palette-outline" },
              { title: "Size", key: "size", icon: "resize-outline" },
              { title: "Brand", key: "brand", icon: "bookmark-outline" },
              { title: "Material", key: "material", icon: "layers-outline" },
              { title: "Condition", key: "condition", icon: "star-outline" },
              { title: "Fit", key: "fit", icon: "body-outline" },
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
                ]}
                value={item ? (item as any)[field.key] || "" : ""}
                onChangeText={(text) =>
                  isOwner &&
                  setItem(item ? { ...item, [field.key]: text } : null)
                }
                editable={isOwner}
                placeholder={`Enter ${field.title.toLowerCase()}`}
                placeholderTextColor="#b0b0b0"
              />
              <View style={styles.divider} />
            </View>
          ))}

          {isOwner && (
            <View style={styles.visibilityContainer}>
              <Text style={styles.visibilityTitle}>Item Visibility</Text>
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => {
                  setItem(
                    item ? { ...item, is_public: !item.is_public } : null
                  );
                }}
              >
                <Text style={styles.visibilityText}>
                  {item?.is_public
                    ? "Public - Anyone can see this item"
                    : "Private - Only you can see this item"}
                </Text>
                <Ionicons
                  name={item?.is_public ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.spacer} />
        </ScrollView>
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
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    position: "relative",
  },
  itemImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    backgroundColor: "white",
  },
  imageActions: {
    position: "absolute",
    bottom: 10,
    right: width * 0.17,
    flexDirection: "row",
  },
  imageActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  detailsContainer: {
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
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginTop: 5,
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
