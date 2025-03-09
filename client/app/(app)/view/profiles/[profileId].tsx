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
import { type Href, router, useLocalSearchParams } from "expo-router";
import type { Look, Profile, TableTypes } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import GridView from "@/components/GridViews/GridView";
import LookGridView from "@/components/GridViews/LookGridView";
import Avatar from "@/components/Avatar";
import Modal from "@/ui/Modal";
import { getClosetWrapped } from "@/api/getClosetWrapped";
import { fetchProfileById } from "@/api/fetchProfiles";
import { useFollow } from "@/contexts/FollowContext";

const { height, width } = Dimensions.get("window");

const tabs: { name: string; tableName: keyof TableTypes; icon: string }[] = [
  { name: "Items", tableName: "items", icon: "shirt-outline" },
  { name: "Outfits", tableName: "outfits", icon: "people-outline" },
  { name: "Looks", tableName: "looks", icon: "albums-outline" },
];

export default function profilePage() {
  const { profileId } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [wrappedText, setWrappedText] = useState<string>(
    "Generating your closet wrapped..."
  );
  const { followingState, toggleFollow, refreshFollowData } = useFollow();
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
        setWrappedText("Could not generate a closet wrapped at this time.");
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

  // Determine if the current profile is followed using our centralized follow state.
  const isFollowing = profile ? followingState[profile.id ?? ""] : false;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar size={80} url={profile?.avatar_url ?? ""} circle />
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
              {/* <TouchableOpacity
                style={styles.circleButton}
                onPress={() => router.push("/profile")}
              >
                <Ionicons name="settings-outline" size={22} color="#333" />
              </TouchableOpacity> */}
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>
              {profile?.display_name || "Name"}
            </Text>
            <Text style={styles.usernameText}>
              @{profile?.username || "username"}
            </Text>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={() => {
                if (profile) {
                  toggleFollow(profile.id ?? "");
                }
              }}
            >
              <Text
                style={[
                  styles.followButtonText,
                  isFollowing && styles.followingButtonText,
                ]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
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
                  profileId={
                    Array.isArray(profileId) ? profileId[0] : profileId
                  }
                />
              ) : (
                <GridView
                  onClick={(item: any, index: number) =>
                    router.push(
                      `/view/wardrobe/${tabs[tabIndex].tableName}/${item.id}` as Href
                    )
                  }
                  tableName={tabs[tabIndex].tableName as keyof TableTypes}
                  profileId={
                    Array.isArray(profileId) ? profileId[0] : profileId
                  }
                />
              )}
            </View>
          </>
        )}

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

        {/* Upload Button: TODO style your friends */}
        {/* <UploadButton onPress={onPlusButtonClick} /> */}
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
    marginHorizontal: 6,
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
  followButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    marginTop: 10,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  followingButton: {
    backgroundColor: "#EAE6E5",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  followingButtonText: {
    color: "#333",
  },
});
