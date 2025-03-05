import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import type { Profile } from "@/types";
import {
  fetchFollowerProfiles,
  fetchFollowingProfiles,
} from "@/api/fetchFollows";
import { handleFollow, handleUnfollow } from "@/api/handleFollows";
import { useSession } from "@/contexts/SessionContext";

function UserItem({
  user,
  isFollowing,
  onToggleFollow,
  onPress,
}: {
  user: Profile;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onPress: () => void;
}) {
  return (
    <View style={styles.userItem}>
      <TouchableOpacity style={styles.userInfo} onPress={onPress}>
        <Avatar size={50} url={user.avatar_url ?? null} circle />
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>
            {user.display_name || user.username}
          </Text>
          <Text style={styles.userHandle}>@{user.username}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.followButton,
          isFollowing ? styles.followingButton : null,
        ]}
        onPress={onToggleFollow}
      >
        <Text
          style={[
            styles.followButtonText,
            isFollowing ? styles.followingButtonText : null,
          ]}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    "following"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [followingState, setFollowingState] = useState<{
    [key: string]: boolean;
  }>({});
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { session } = useSession();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    fetchData();
  }, [fadeAnim]);

  const fetchData = useCallback(async () => {
    if (!session || !session.user.id) return;
    try {
      const followersData = await fetchFollowerProfiles(session.user.id);
      setFollowers(followersData);

      const followingData = await fetchFollowingProfiles(session.user.id);
      setFollowing(followingData);

      // Initialize following state
      const followState: { [key: string]: boolean } = {};
      [...followersData, ...followingData].forEach((profile) => {
        // Assume all profiles in following list are being followed
        followState[profile.id ?? ""] = followingData.some(
          (p) => p.id === profile.id
        );
      });
      setFollowingState(followState);
    } catch (error) {
      console.error("Error fetching community data:", error);
    }
  }, [session]);

  const handleSync = (type: "contacts" | "facebook") => {
    console.log("Sync", type);
  };

  const handleInvite = () => {
    console.log("Invite friends");
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleToggleFollow = async (profileId: string) => {
    if (!session || !session.user.id) return;

    try {
      if (followingState[profileId]) {
        await handleUnfollow(session.user.id, profileId);
      } else {
        await handleFollow(session.user.id, profileId);
      }

      // Update local state
      setFollowingState((prev) => ({
        ...prev,
        [profileId]: !prev[profileId],
      }));

      // Update lists if needed
      if (followingState[profileId]) {
        // If we just unfollowed, remove from following list
        setFollowing((prev) => prev.filter((p) => p.id !== profileId));
      } else {
        // If we just followed, add to following list
        const profileToAdd = followers.find((p) => p.id === profileId);
        if (profileToAdd && !following.some((p) => p.id === profileId)) {
          setFollowing((prev) => [...prev, profileToAdd]);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const navigateToProfile = (profileId: string) => {
    router.push({
      pathname: "/view/profiles/[profileId]",
      params: { profileId },
    });
  };

  // Filter users based on search query
  const filteredUsers = (
    activeTab === "following" ? following : followers
  ).filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>My Community</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "following" && styles.activeTab]}
            onPress={() => setActiveTab("following")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "following" && styles.activeTabText,
              ]}
            >
              {following.length} Following
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "followers" && styles.activeTab]}
            onPress={() => setActiveTab("followers")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "followers" && styles.activeTabText,
              ]}
            >
              {followers.length} Followers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6b7280"
          />
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                isFollowing={followingState[user.id ?? ""]}
                onToggleFollow={() => handleToggleFollow(user.id ?? "")}
                onPress={() => navigateToProfile(user.id ?? "")}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? "No results found"
                  : activeTab === "following"
                  ? "You're not following anyone yet"
                  : "You don't have any followers yet"}
              </Text>
            </View>
          )}
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
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#333",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userTextContainer: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userHandle: {
    fontSize: 14,
    color: "#666",
  },
  followButton: {
    backgroundColor: "#333",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
});
