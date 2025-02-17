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
  TouchableOpacity,
} from "react-native";
import { type Href, router } from "expo-router";
import type { Look, TableTypes } from "@/types";
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
      items: "/new/wardrobe/item",
      outfits: "/new/wardrobe/outfit",
      looks: "/new/wardrobe/look",
    };
    router.push(paths[tabs[tabIndex].tableName] as Href);
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUrl || "https://via.placeholder.com/80" }}
              style={styles.avatar}
            />
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={styles.circleButton}>
                <Ionicons name="bookmark-outline" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleButton}>
                <Ionicons name="analytics-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>{username || "Name"}</Text>
            <Text style={styles.usernameText}>@{username || "name"}</Text>
          </View>
        </View>
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
            if (look.id) router.push(`/view/wardrobe/looks/${look.id}` as Href);
          }}
          tableName={tabs[tabIndex].tableName as keyof TableTypes}
        />
      ) : (
        <Feed
          onClick={(item: any, index: number) =>
            router.push(
              `/view/wardrobe/${tabs[tabIndex].tableName}/${item.id}` as Href
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
    paddingTop: 20,
    paddingBottom: 24,
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 16,
  },
  headerContent: {
    width: "100%",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAE6E5",
    marginBottom: 10,
  },
  textContainer: {
    alignItems: "center",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  usernameText: {
    fontSize: 14,
    color: "#888",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAE6E5",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
});
