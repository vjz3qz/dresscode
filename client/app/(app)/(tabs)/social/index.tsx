import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView as ScrollViewRN } from "react-native";
import { fetchSuggestedProfiles } from "@/api/fetchProfiles";
import { Profile } from "@/types";
import { handleFollow, handleUnfollow } from "@/api/handleFollows";
import { useSession } from "@/contexts/SessionContext";

interface Post {
  id: string;
  user: Profile;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

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

export default function FeedScreen() {
  // Dummy data - replace with real data from your API
  const posts: Post[] = [
    {
      id: "1",
      user: {
        id: "1",
        username: "varun",
        avatar_url:
          "https://ytfwgtbpdxaotawaostn.supabase.co/storage/v1/object/sign/images/1740186532128.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvMTc0MDE4NjUzMjEyOC5qcGciLCJpYXQiOjE3NDAxODc0MjUsImV4cCI6MTc0MDc5MjIyNX0.OI0a3449PHP4FuCDzo9l1Sjw6Gp7B6qCUPB8bE2QsqA",
        gender: "male",
        age: 21,
        preferences: [],
        brands: [],
      },
      imageUrl:
        "https://ytfwgtbpdxaotawaostn.supabase.co/storage/v1/object/sign/images/IMG_6610.JPG?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvSU1HXzY2MTAuSlBHIiwiaWF0IjoxNzQwMTg3Mzg4LCJleHAiOjE3NDA3OTIxODh9.2xnd6avEKrH0K-BdME7BAn4rHkIWHFzRqsGtYBk4NZs",
      caption: "Today's outfit #ootd #fashion",
      likes: 124,
      comments: 8,
      timestamp: "2h",
    },
    // Add more posts...
  ];

  const handleLike = (postId: string) => {
    // Implement like logic
    console.log("Like post:", postId);
  };

  const handleComment = (postId: string) => {
    // Implement comment logic
    console.log("Comment on post:", postId);
  };

  const handleShare = (postId: string) => {
    // Implement share logic
    console.log("Share post:", postId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity onPress={() => router.push("/social/community")}>
          <Ionicons name="people-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {posts.map((post) => (
          <View key={post.id} style={styles.post}>
            <View style={styles.postHeader}>
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => {
                  router.push({
                    pathname: "/view/profiles/[profileId]",
                    params: { profileId: post.user.id ?? "" },
                  });
                }}
              >
                <Avatar size={40} url={post.user.avatar_url ?? null} />
                <Text style={styles.username}>{post.user.username}</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

            <View style={styles.postActions}>
              <View style={styles.leftActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(post.id)}
                >
                  <Ionicons name="heart-outline" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleComment(post.id)}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShare(post.id)}
                >
                  <Ionicons name="paper-plane-outline" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.postContent}>
              <Text style={styles.likes}>{post.likes} likes</Text>
              <View style={styles.captionContainer}>
                <Text style={styles.username}>{post.user.username}</Text>
                <Text style={styles.caption}> {post.caption}</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.comments}>
                  View all {post.comments} comments
                </Text>
              </TouchableOpacity>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
          </View>
        ))}
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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  post: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    marginLeft: 8,
    fontWeight: "600",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: 16,
  },
  postContent: {
    paddingHorizontal: 12,
  },
  likes: {
    fontWeight: "600",
    marginBottom: 4,
  },
  captionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  caption: {
    flex: 1,
  },
  comments: {
    color: "#666",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
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
});
