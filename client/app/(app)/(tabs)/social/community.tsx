"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  // Added alias for horizontal scroll view
  ScrollView as ScrollViewRN,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { Profile } from "@/types";
import {
  fetchFollowerProfiles,
  fetchFollowingProfiles,
} from "@/api/fetchFollows";
import { fetchSuggestedProfiles } from "@/api/fetchProfiles";
import { handleFollow, handleUnfollow } from "@/api/handleFollows";
import { useSession } from "@/contexts/SessionContext";

function FollowSuggestions() {
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<{ [key: string]: boolean }>({});
  const { session } = useSession();

  useEffect(() => {
    async function getSuggestedUsers() {
      const fetchedProfiles: Profile[] = await fetchSuggestedProfiles();
      setSuggestedUsers(fetchedProfiles);

      // Initialize following state
      const initialFollowingState: { [key: string]: boolean } = {};
      fetchedProfiles.forEach((user) => {
        initialFollowingState[user.id ?? ""] = false; // Assume not following initially
      });
      setFollowing(initialFollowingState);
    }
    getSuggestedUsers();
  }, []);

  const toggleFollow = async (userId: string) => {
    if (following[userId]) {
      await handleUnfollow(session?.user?.id ?? "", userId);
    } else {
      await handleFollow(session?.user?.id ?? "", userId);
    }
    setFollowing((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };
  if (suggestedUsers.length === 0) return <></>;

  return (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Suggested for you</Text>
      <ScrollViewRN horizontal showsHorizontalScrollIndicator={false}>
        {suggestedUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.suggestionItem}
            onPress={() => {
              router.push({
                pathname: "/view/profiles/[profileId]",
                params: { profileId: user.id ?? "" },
              });
            }}
          >
            <Avatar size={60} url={user.avatar_url ?? null} />
            <Text style={styles.suggestionUsername}>{user.username}</Text>
            <TouchableOpacity
              style={
                following[user.id ?? ""]
                  ? styles.unfollowButton
                  : styles.followButton
              }
              onPress={() => toggleFollow(user.id ?? "")}
            >
              <Text
                style={
                  following[user.id ?? ""]
                    ? styles.unfollowButtonText
                    : styles.followButtonText
                }
              >
                {following[user.id ?? ""] ? "Unfollow" : "Follow"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollViewRN>
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
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useSession();

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    if (!session || !session.user.id) return;
    try {
      const followersData = await fetchFollowerProfiles(session.user.id);
      setFollowers(followersData);
      const followingData = await fetchFollowingProfiles(session.user.id);
      setFollowing(followingData);
    } catch (error) {
      console.error("Error fetching community data:", error);
    }
  };

  const handleSync = (type: "contacts" | "facebook") => {
    console.log("Sync", type);
  };

  const handleInvite = () => {
    console.log("Invite friends");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My community</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "following" && styles.activeTab]}
          onPress={() => setActiveTab("following")}
        >
          <Text style={styles.tabText}>{following.length} Following</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "followers" && styles.activeTab]}
          onPress={() => setActiveTab("followers")}
        >
          <Text style={styles.tabText}>{followers.length} Followers</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.syncSection}>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={() => handleSync("contacts")}
          >
            <View style={styles.syncIconContainer}>
              <Ionicons name="people" size={24} color="#000" />
            </View>
            <View style={styles.syncTextContainer}>
              <Text style={styles.syncTitle}>Contacts</Text>
              <Text style={styles.syncSubtitle}>
                Find friends from contacts
              </Text>
            </View>
            <TouchableOpacity
              style={styles.syncActionButton}
              onPress={() => handleSync("contacts")}
            >
              <Text style={styles.syncActionText}>Sync</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={() => handleSync("facebook")}
          >
            <View style={styles.syncIconContainer}>
              <Ionicons name="logo-facebook" size={24} color="#1877f2" />
            </View>
            <View style={styles.syncTextContainer}>
              <Text style={styles.syncTitle}>Facebook Friends</Text>
              <Text style={styles.syncSubtitle}>
                Find friends from Facebook
              </Text>
            </View>
            <TouchableOpacity
              style={styles.syncActionButton}
              onPress={() => handleSync("facebook")}
            >
              <Text style={styles.syncActionText}>Sync</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.inviteButton} onPress={handleInvite}>
          <Ionicons name="person-add" size={24} color="#000" />
          <Text style={styles.inviteButtonText}>Invite friends</Text>
        </TouchableOpacity>

        <View style={styles.userList}>
          {(activeTab === "following" ? following : followers).map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userInfo}>
                <Avatar size={50} url={user.avatar_url ?? null} />
                <View style={styles.userTextContainer}>
                  <Text style={styles.userName}>{user.display_name}</Text>
                  <Text style={styles.userHandle}>{user.username}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.unfollowButton}
                onPress={() =>
                  handleUnfollow(session?.user.id ?? "", user.id ?? "")
                }
              >
                <Text style={styles.unfollowButtonText}>Unfollow</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Suggested Followers */}
        <FollowSuggestions />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  // Follow suggestions styles
  suggestionsContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  suggestionItem: {
    alignItems: "center",
    marginRight: 16,
    width: 80,
  },
  suggestionUsername: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    textAlign: "center",
  },
  followButton: {
    backgroundColor: "#0095f6",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  unfollowButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  unfollowButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Community page styles
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  syncSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  syncIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  syncTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  syncSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  syncActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
  },
  syncActionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(104, 143, 229, 0.5)",
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  inviteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  userList: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userTextContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  userHandle: {
    fontSize: 14,
    color: "#666",
  },
});
