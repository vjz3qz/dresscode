import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import { useFollow } from "@/contexts/FollowContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.42;
const CARD_MARGIN = 10;

function ProfileCard({
  profile,
  onPress,
  onFollowTogglePress,
  isFollowing = false,
}: {
  profile: Profile;
  onPress: () => void;
  onFollowTogglePress: () => void;
  isFollowing: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <Avatar
          size={CARD_WIDTH - 20}
          url={profile.avatar_url ?? null}
          circle={false}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>
          {profile.display_name || profile.username}
        </Text>
        <Text style={styles.cardUsername} numberOfLines={1}>
          @{profile.username}
        </Text>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={onFollowTogglePress}
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
    </TouchableOpacity>
  );
}

function ProfileSection({
  title,
  profiles,
  followingState,
  onFollowToggle,
  onProfilePress,
}: {
  title: string;
  profiles: Profile[];
  followingState: { [key: string]: boolean };
  onFollowToggle: (id: string) => void;
  onProfilePress: (id: string) => void;
}) {
  if (!profiles || profiles.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.profilesRow}
      >
        {profiles.map((profile: Profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isFollowing={followingState[profile.id ?? ""]}
            onFollowTogglePress={() => onFollowToggle(profile.id ?? "")}
            onPress={() => onProfilePress(profile.id ?? "")}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function SocialScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const {
    followingState,
    followingProfiles,
    suggestedProfiles,
    popularProfiles,
    toggleFollow,
    refreshFollowData,
  } = useFollow();
  const { session } = useSession();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFollowData();
    setRefreshing(false);
  }, [refreshFollowData]);

  const handleFollowToggle = async (profileId: string) => {
    await toggleFollow(profileId);
  };

  const navigateToProfile = (profileId: string) => {
    router.push({
      pathname: "/view/profiles/[profileId]",
      params: { profileId },
    });
  };

  const navigateToCommunity = () => {
    router.push("/social/community");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
          <TouchableOpacity
            onPress={navigateToCommunity}
            style={styles.communityButton}
          >
            <Ionicons name="people-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6b7280"
          />
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Following Section */}
          <ProfileSection
            title="People You Follow"
            profiles={followingProfiles}
            followingState={followingState}
            onFollowToggle={handleFollowToggle}
            onProfilePress={navigateToProfile}
          />

          {/* Suggested Section */}
          {/* <ProfileSection
            title="Suggested For You"
            profiles={suggestedProfiles}
            followingState={followingState}
            onFollowToggle={handleFollowToggle}
            onProfilePress={navigateToProfile}
          /> */}

          {/* Popular Section */}
          <ProfileSection
            title="Popular Profiles"
            profiles={popularProfiles}
            followingState={followingState}
            onFollowToggle={handleFollowToggle}
            onProfilePress={navigateToProfile}
          />
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  communityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 15,
    color: "#333",
  },
  profilesRow: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  profileCard: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardImageContainer: {
    alignItems: "center",
    paddingTop: 10,
  },
  cardContent: {
    padding: 12,
    alignItems: "center",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  cardUsername: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  followButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
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
