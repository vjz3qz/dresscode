import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/Supabase";
import { useSession } from "@/contexts/SessionContext";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Share,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Linking,
} from "react-native";
import { Button, Input } from "@rneui/themed";
import Avatar from "@/components/Avatar";
import { handleUpdateProfile } from "@/api/CreateProfile";
import { useKeyboardAvoidingView } from "@/hooks/useKeyboardAvoidingView";

export default function ProfileScreen() {
  const {
    session,
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    loading,
    displayName,
    setDisplayName,
  } = useSession();
  const [updateProfilePageOpen, setUpdateProfilePageOpen] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const keyboardHeight = useKeyboardAvoidingView();
  const [newUsername, setNewUsername] = useState(username || "");
  const [newDisplayName, setNewDisplayName] = useState(displayName || "");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  function UpdateProfilePage() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Animated.View
            style={[
              styles.content,
              { paddingBottom: keyboardHeight, opacity: fadeAnim },
            ]}
          >
            <Text style={styles.title}>Update Your Profile</Text>

            <View style={styles.avatarContainer}>
              <Text style={styles.label}>Profile Picture</Text>
              <Avatar
                size={120}
                url={avatarUrl}
                onUpload={(url: string) => {
                  setAvatarUrl(url);
                  handleUpdateProfileCall({ avatar_url: url });
                }}
              />
            </View>

            <Text style={styles.label}>Username</Text>
            <Input
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Enter your username"
              containerStyle={styles.inputContainer}
            />

            <Text style={styles.label}>Display Name</Text>
            <Input
              value={newDisplayName}
              onChangeText={setNewDisplayName}
              placeholder="Enter your display name"
              containerStyle={styles.inputContainer}
            />

            <Text style={styles.label}>Email</Text>
            <Input
              value={session?.user?.email}
              disabled
              containerStyle={styles.inputContainer}
            />

            <Button
              title={loading ? "Updating..." : "Update Profile"}
              onPress={() => handleUpdateAndReturn()}
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              disabled={loading}
            />

            <TouchableOpacity
              onPress={() => setUpdateProfilePageOpen(false)}
              style={styles.cancelButtonContainer}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    );
  }

  const handleUpdateAndReturn = async () => {
    if (newUsername.trim() === "") {
      Alert.alert("Username cannot be empty!");
      return;
    }

    await handleUpdateProfileCall({
      username: newUsername,
      display_name: newDisplayName,
    });

    if (newUsername !== username) {
      setUsername(newUsername);
    }

    if (newDisplayName !== displayName) {
      setDisplayName(newDisplayName);
    }

    setUpdateProfilePageOpen(false);
  };

  async function handleUpdateProfileCall({
    username,
    display_name,
    avatar_url,
    gender,
    age,
    brands,
    preferences,
  }: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    gender?: string;
    age?: number;
    brands?: string[];
    preferences?: string[];
  }) {
    if (!username && !avatar_url && !display_name) return;
    try {
      await handleUpdateProfile({
        username,
        display_name,
        avatar_url,
        gender,
        age,
        brands,
        preferences,
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }
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

  return updateProfilePageOpen ? (
    <UpdateProfilePage />
  ) : (
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
            onPress={() => setUpdateProfilePageOpen(true)}
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
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: "#333",
  },
  inputContainer: {
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
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
  button: {
    backgroundColor: "#333",
    borderRadius: 25,
    paddingVertical: 12,
  },
  buttonContainer: {
    marginTop: 20,
    width: "100%",
  },
  cancelButtonContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});
