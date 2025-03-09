import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/Supabase";
import { useSession } from "@/contexts/SessionContext";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Share,
  SafeAreaView,
  Animated,
  Easing,
  Linking,
} from "react-native";
import Avatar from "@/components/Avatar";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { username, avatarUrl, displayName } = useSession();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Check out this awesome app! Download it here: https://yourappdownloadlink.com",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type: ", result.activityType);
        } else {
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing app:", error);
    }
  };

  const phoneNumber = process.env.EXPO_PUBLIC_PHONE_NUMBER;

  const makeCall = () => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.profileContent}
      >
        <View style={styles.profileHeader}>
          <Avatar size={100} url={avatarUrl} circle />
          <Text style={styles.nameText}>{displayName || "Name"}</Text>
          <Text style={styles.usernameText}>@{username || "username"}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/settings/editProfile")}
          >
            <Text style={styles.actionButtonText}>Edit your profile</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Edit your measurements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Text style={styles.actionButtonText}>Invite a friend</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Brand Blacklist</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.actionButton} onPress={makeCall}>
            <Text style={styles.actionButtonText}>Leave Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE6E5",
  },
  profileContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    color: "#333",
  },
  usernameText: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
  },
  actionButton: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  signOutButton: {
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: "center",
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
