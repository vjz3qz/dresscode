import UploadButton from "@/ui/UploadButton";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  SafeAreaView,
  Dimensions,
  Image,
} from "react-native";
import { fetchAllImageUrls } from "@/api/FetchImageUrl";
import { router } from "expo-router";
import { Item, TableTypes } from "@/types";
import Feed from "@/components/Feeds/Feed";
import LookFeed from "@/components/Feeds/LookFeed";
import ImageGallery from "@/components/ImageGallery";
import { useSession } from "@/contexts/SessionContext";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const tabs = [
  { name: "Items", tableName: "items" },
  { name: "Outfits", tableName: "outfits" },
  { name: "Looks", tableName: "looks" },
];

export default function WardrobeScreen() {
  const { session, username, setUsername, avatarUrl, setAvatarUrl, loading } =
    useSession();
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  function onPlusButtonClick() {
    if (tabs[tabIndex]["tableName"] === "items") {
      router.push("/wardrobe/new/item");
    } else if (tabs[tabIndex]["tableName"] === "outfits") {
      router.push("/wardrobe/new/outfit");
    } else if (tabs[tabIndex]["tableName"] === "looks") {
      router.push("/wardrobe/new/look");
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      let items: any[] = [];
      try {
        if (!session) {
          return;
        }
        items = await fetchAllImageUrls(
          tabs[tabIndex]["tableName"] as keyof TableTypes,
          session
        );
      } catch (error: any) {
        console.error("Error fetching items:", error.message);
        setData([]);
        return;
      }
      setData(items);
    };

    fetchItems();
  }, [tabIndex]);

  if (selectedImageIndex !== null) {
    return (
      <ImageGallery
        loading={false}
        data={data.map((object) => object.image_url)}
        selectedImageIndex={selectedImageIndex}
        onClose={() => {
          setSelectedImageIndex(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <Image
        source={{ uri: avatarUrl || "https://via.placeholder.com/80" }}
        style={styles.avatar}
      />
      <Text style={styles.nameText}>{username || "Name"}</Text>
      <Text style={styles.usernameText}>@{username || "name"}</Text>
      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome to Dress Code.</Text>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((item, index) => {
          const isActive = index === tabIndex;
          return (
            <TouchableWithoutFeedback
              key={item.name}
              onPress={() => setTabIndex(index)}
            >
              <View style={[styles.item, isActive && styles.activeItem]}>
                <Text style={[styles.text, isActive && styles.activeText]}>
                  {item.name}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#6b7280"
        />
        <Ionicons name="mic-outline" size={20} color="#6b7280" />
      </View>

      {/* Feeds */}
      {tabs[tabIndex]["tableName"] === "looks" ? (
        <LookFeed
          onLookClick={(look: any, index: number) => {
            router.push(`/wardrobe/view/look-outfits/${look.id}`);
          }}
          tableName={tabs[tabIndex]["tableName"] as keyof TableTypes}
        />
      ) : (
        <Feed
          onObjectClick={(item: Item, index: number) => {
            setSelectedImageIndex(index);
          }}
          tableName={tabs[tabIndex]["tableName"] as keyof TableTypes}
        />
      )}

      {/* Upload Button */}
      <UploadButton onPress={onPlusButtonClick} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6", // Placeholder background color
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
    color: "#333",
  },
  welcomeText: {
    fontSize: 14,
    color: "#6b7280",
    paddingHorizontal: 8,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE6E5",
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAll: {
    fontSize: 14,
    color: "#6b7280",
    textDecorationLine: "underline",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingTop: 12,

    paddingHorizontal: 16,
    justifyContent: "space-around",
  },
  item: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 8,
    width: 100, // Fixed width for each tab
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280", // Neutral gray for inactive text
  },
  activeItem: {
    backgroundColor: "#EAE6E5", // Light background for active tab
    borderRadius: 8,
  },
  activeText: {
    color: "#0f0f0f",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAE6E5",
    marginBottom: 10,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  usernameText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
});
