import UploadButton from "@/ui/UploadButton";
import React, { useState, useCallback, useEffect } from "react";
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
import { type Href, router, useLocalSearchParams } from "expo-router";
import type { Look, Profile, TableTypes } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import GridView from "@/components/GridViews/GridView";
import LookGridView from "@/components/GridViews/LookGridView";
import Avatar from "@/components/Avatar";
import Modal from "@/ui/Modal";
import { getClosetWrapped } from "@/api/getClosetWrapped";
import { fetchProfileById } from "@/api/fetchProfiles";

const { height } = Dimensions.get("window");

const tabs: { name: string; tableName: keyof TableTypes }[] = [
  { name: "Items", tableName: "items" },
  { name: "Outfits", tableName: "outfits" },
  { name: "Looks", tableName: "looks" },
];

export default function profilePage() {
  const { profileId } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>();
  const [tabIndex, setTabIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [wrappedText, setWrappedText] = useState<string>(
    "Generating your closet wrapped..."
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const fetchedProfile: Profile = await fetchProfileById(
          Array.isArray(profileId) ? profileId[0] : profileId
        );
        setProfile(fetchedProfile);
      } catch (error: any) {
        console.error("Error fetching profile by id:", error.message);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchClosetWrapped = async () => {
      if (!modalVisible) return;
      try {
        const fetchedWrappedText: string = await getClosetWrapped(
          Array.isArray(profileId) ? profileId[0] : profileId
        );
        setWrappedText(fetchedWrappedText);
      } catch (error: any) {
        console.error("Error fetching wrapped:", error.message);
        setWrappedText("");
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
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Avatar size={80} url={profile?.avatar_url ?? ""} circle />
            {profile?.is_public && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={styles.circleButton}>
                  <Ionicons name="bookmark-outline" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.circleButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons name="analytics-outline" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>
              {profile?.display_name || "Name"}
            </Text>
            <Text style={styles.usernameText}>
              @{profile?.username || "username"}
            </Text>
          </View>
        </View>
      </View>

      {/* Private Profile Handling */}
      {!profile?.is_public ? (
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>This profile is private.</Text>
        </View>
      ) : (
        <>
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
                    style={[
                      styles.text,
                      index === tabIndex && styles.activeText,
                    ]}
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

          {/* GridViews */}
          {tabIndex === 2 ? (
            <LookGridView
              onLookClick={(look: Look) => {
                if (look.id)
                  router.push(`/view/wardrobe/looks/${look.id}` as Href);
              }}
              tableName={tabs[tabIndex].tableName as keyof TableTypes}
              profileId={Array.isArray(profileId) ? profileId[0] : profileId}
            />
          ) : (
            <GridView
              onClick={(item: any) =>
                router.push(
                  `/view/wardrobe/${tabs[tabIndex].tableName}/${item.id}` as Href
                )
              }
              tableName={tabs[tabIndex].tableName as keyof TableTypes}
              profileId={Array.isArray(profileId) ? profileId[0] : profileId}
            />
          )}
        </>
      )}

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        transparent
      >
        <Text>{wrappedText}</Text>
      </Modal>
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
  privateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  privateText: {
    fontSize: 18,
    color: "#888",
    fontWeight: "bold",
  },
});
