import React, { useState, useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { Button, Input } from "@rneui/themed";
import Avatar from "@/components/Avatar";
import { handleUpdateProfile } from "@/api/CreateProfile";
import { useKeyboardAvoidingView } from "@/hooks/useKeyboardAvoidingView";
import { router } from "expo-router";

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

    router.dismiss();
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
            onPress={() => router.dismiss()}
            style={styles.cancelButtonContainer}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
