import UploadButton from "@/ui/UploadButton";
import React, { useState, useCallback } from "react";
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
import { Href, router } from "expo-router";
import { Item, Look, TableTypes } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import { Ionicons } from "@expo/vector-icons";
import Feed from "@/components/Feeds/Feed";
import LookFeed from "@/components/Feeds/LookFeed";

const { height } = Dimensions.get("window");

const tabs: { name: string; tableName: keyof TableTypes }[] = [
  { name: "Items", tableName: "items" },
  { name: "Outfits", tableName: "outfits" },
  { name: "Looks", tableName: "looks" },
];

export default function WardrobeScreen() {
  const { username, avatarUrl } = useSession();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabClick = useCallback((index: number) => setTabIndex(index), []);

  function onPlusButtonClick() {
    const paths = {
      items: "/wardrobe/new/item",
      outfits: "/wardrobe/new/outfit",
      looks: "/wardrobe/new/look",
    };
    router.push(paths[tabs[tabIndex].tableName] as Href);
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: avatarUrl || "https://via.placeholder.com/80" }}
          style={styles.avatar}
        />
        <Text style={styles.nameText}>{username || "Name"}</Text>
        <Text style={styles.usernameText}>@{username || "name"}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((item, index) => (
          <TouchableWithoutFeedback
            key={item.name}
            onPress={() => handleTabClick(index)}
          >
            <View
              style={[styles.item, index === tabIndex && styles.activeItem]}
            >
              <Text
                style={[styles.text, index === tabIndex && styles.activeText]}
              >
                {item.name}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
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
      {tabIndex === 2 ? (
        <LookFeed
          onLookClick={(look: Look, index: number) => {
            if (look.id) router.push(`/wardrobe/view/looks/${look.id}` as Href);
          }}
          tableName={tabs[tabIndex].tableName as keyof TableTypes}
        />
      ) : (
        <Feed
          onObjectClick={(item: any, index: number) =>
            router.push(
              `/wardrobe/view/${tabs[tabIndex].tableName}/${item.id}` as Href
            )
          }
          tableName={tabs[tabIndex].tableName as keyof TableTypes}
        />
      )}

      {/* Upload Button */}
      <UploadButton onPress={onPlusButtonClick} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
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
    borderRadius: 8,
    width: 100,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeItem: {
    backgroundColor: "#EAE6E5",
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
