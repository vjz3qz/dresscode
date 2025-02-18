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
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView as ScrollViewRN } from "react-native";

interface Post {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface SuggestedUser {
  id: string;
  username: string;
  avatarUrl?: string;
}

function FollowSuggestions() {
  const suggestedUsers: SuggestedUser[] = [
    {
      id: "6",
      username: "fashionista",
      avatarUrl: "https://via.placeholder.com/40",
    },
    {
      id: "7",
      username: "styleguru",
      avatarUrl: "https://via.placeholder.com/40",
    },
    {
      id: "8",
      username: "trendsetterxo",
      avatarUrl: "https://via.placeholder.com/40",
    },
    {
      id: "9",
      username: "chic_styles",
      avatarUrl: "https://via.placeholder.com/40",
    },
    {
      id: "10",
      username: "fashion_forward",
      avatarUrl: "https://via.placeholder.com/40",
    },
  ];

  return (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Suggested for you</Text>
      <ScrollViewRN horizontal showsHorizontalScrollIndicator={false}>
        {suggestedUsers.map((user) => (
          <TouchableOpacity key={user.id} style={styles.suggestionItem}>
            <Avatar size={60} url={user.avatarUrl ?? null} />
            <Text style={styles.suggestionUsername}>{user.username}</Text>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
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
        username: "whering",
        avatarUrl: "https://via.placeholder.com/40",
      },
      imageUrl: "https://via.placeholder.com/400",
      caption: "Today's outfit! 🌟 #ootd #fashion",
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

      <FollowSuggestions />

      <ScrollView>
        {posts.map((post) => (
          <View key={post.id} style={styles.post}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Avatar size={40} url={post.user.avatarUrl ?? null} />
                <Text style={styles.username}>{post.user.username}</Text>
              </View>
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
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  followButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
