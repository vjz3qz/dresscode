import UploadButton from "@/ui/UploadButton";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { type Href, router } from "expo-router";
import type { Look, TableTypes } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import { Ionicons } from "@expo/vector-icons";
import GridView from "@/components/GridViews/GridView";
import LookGridView from "@/components/GridViews/LookGridView";
import Avatar from "@/components/Avatar";
import Modal from "@/ui/Modal";
import { getClosetWrapped } from "@/api/getClosetWrapped";

const { height, width } = Dimensions.get("window");

const tabs: { name: string; tableName: keyof TableTypes; icon: string }[] = [
  { name: "Items", tableName: "items", icon: "shirt-outline" },
  { name: "Outfits", tableName: "outfits", icon: "people-outline" },
  { name: "Looks", tableName: "looks", icon: "albums-outline" },
];

export default function WardrobeScreen() {
  const { username, avatarUrl, displayName } = useSession();
  const [tabIndex, setTabIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [wrappedText, setWrappedText] = useState<string>(
    "Generating your closet wrapped..."
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const fetchClosetWrapped = async () => {
      if (!modalVisible) return;
      try {
        const fetchedWrappedText: string = await getClosetWrapped();
        setWrappedText(fetchedWrappedText);
      } catch (error: any) {
        console.error("Error fetching wrapped:", error.message);
        setWrappedText("Could not generate your closet wrapped at this time.");
      }
    };

    fetchClosetWrapped();
  }, [modalVisible]);

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
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar size={80} url={avatarUrl} circle />
            <View style={styles.actionButtons}>
              {/* <TouchableOpacity style={styles.circleButton}>
                <Ionicons name="bookmark-outline" size={24} color="#333" />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="analytics-outline" size={22} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => router.push("/profile")}
              >
                <Ionicons name="settings-outline" size={22} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{displayName || "Name"}</Text>
            <Text style={styles.usernameText}>@{username || "username"}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((item, index) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleTabClick(index)}
              style={[
                styles.tabItem,
                index === tabIndex && styles.activeTabItem,
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={index === tabIndex ? "#333" : "#6b7280"}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  index === tabIndex && styles.activeTabText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
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
          {tabIndex === 2 ? (
            <LookGridView
              onLookClick={(look: Look, index: number) => {
                if (look.id)
                  router.push(`/view/wardrobe/looks/${look.id}` as Href);
              }}
              tableName={tabs[tabIndex].tableName as keyof TableTypes}
            />
          ) : (
            <GridView
              onClick={(item: any, index: number) =>
                router.push(
                  `/view/wardrobe/${tabs[tabIndex].tableName}/${item.id}` as Href
                )
              }
              tableName={tabs[tabIndex].tableName as keyof TableTypes}
            />
          )}
        </View>

        {/* Wrapped Modal */}
        <Modal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          transparent
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Closet Wrapped</Text>
            <View style={styles.wrappedContainer}>
              <Text style={styles.wrappedText}>{wrappedText}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Upload Button */}
        <UploadButton onPress={onPlusButtonClick} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE6E5",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: "row",
  },
  profileInfo: {
    alignItems: "center",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  usernameText: {
    fontSize: 16,
    color: "#666",
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAE6E5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#EAE6E5",
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: "#EAE6E5",
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    // marginHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: width * 0.8,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  wrappedContainer: {
    backgroundColor: "#EAE6E5",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 20,
  },
  wrappedText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
  },
  closeButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
