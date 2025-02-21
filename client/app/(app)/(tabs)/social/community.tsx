"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import React from "react";
import { Profile } from "@/types";
import {
  fetchFollowerProfiles,
  fetchFollowingProfiles,
} from "@/api/fetchFollows";
import { useSession } from "@/contexts/SessionContext";

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    "following"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const { session } = useSession();

  useEffect(() => {
    // Fetch followers and following data from Supabase or any other source
    async function fetchData() {
      if (!session || !session.user.id) return;
      const followersData = await fetchFollowerProfiles(session.user.id);
      setFollowers(followersData);
      const followingData = await fetchFollowingProfiles(session.user.id);
      setFollowing(followingData);
    }
    fetchData();
  }, []);

  const handleUnfollow = (userId: string) => {
    // Implement unfollow logic
    console.log("Unfollow user:", userId);
  };

  const handleSync = (type: "contacts" | "facebook") => {
    // Implement sync logic
    console.log("Sync", type);
  };

  const handleInvite = () => {
    // Implement invite logic
    console.log("Invite friends");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My community</Text>
        <View style={{ width: 24 }} />
      </View>

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

      <ScrollView style={styles.content}>
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
                onPress={() => handleUnfollow(user.id ?? "")}
              >
                <Text style={styles.unfollowButtonText}>Unfollow</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
    // backgroundColor: "#e9e5ff",
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
  unfollowButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
  },
  unfollowButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
