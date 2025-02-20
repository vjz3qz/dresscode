import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/Supabase";
import { useSession } from "@/contexts/SessionContext"; // Adjust the import path as needed
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Button,
} from "react-native";
import { Session } from "@supabase/supabase-js";
import { Input } from "@rneui/themed";
import Avatar from "@/components/Avatar";
import { handleUpdateProfile } from "@/api/CreateProfile";

export default function Account() {
  const {
    session,
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    loading,
    displayName,
  } = useSession();
  const [updateProfilePageOpen, setUpdateProfilePageOpen] = useState(false);

  function UpdateProfilePage({
    username,
    setUsername,
    avatarUrl,
  }: {
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    avatarUrl: string;
  }) {
    return (
      <View style={styles.updateContainer}>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input label="Email" value={session?.user?.email} disabled />
        </View>
        <View style={styles.verticallySpaced}>
          <Input
            label="Username"
            value={username || ""}
            onChangeText={(text) => setUsername(text)}
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? "Loading ..." : "Update"}
            onPress={() => handleUpdateProfileCall({ username })}
            disabled={loading}
          />
        </View>
        <View>
          <Avatar
            size={200}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              handleUpdateProfileCall({ avatar_url: url });
            }}
          />
        </View>
        <TouchableOpacity
          style={[styles.cancelButton, styles.mt20]}
          onPress={() => setUpdateProfilePageOpen(false)}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      handleUpdateProfile({
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

  return updateProfilePageOpen ? (
    <UpdateProfilePage
      username={username}
      setUsername={setUsername}
      avatarUrl={avatarUrl}
    />
  ) : (
    <View style={styles.container}>
      <Avatar size={80} url={avatarUrl} circle />
      <Text style={styles.nameText}>{displayName || "Name"}</Text>
      <Text style={styles.usernameText}>@{username || "name"}</Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setUpdateProfilePageOpen(true)}
      >
        <Text style={styles.buttonText}>Edit your profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit your measurements</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Invite a friend</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Brand Blacklist</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Leave Feedback</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  updateContainer: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verticallySpaced: {
    marginBottom: 15,
  },
  mt20: {
    marginTop: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 100,
    backgroundColor: "#FFFFFF",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  usernameText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#EAE6E5",
    alignItems: "center",
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
  bottomNav: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#EAE6E5",
    paddingVertical: 10,
  },
  navIcon: {
    fontSize: 24,
    color: "#333",
  },
  updateButton: {
    backgroundColor: "#007AFF",
    borderRadius: 5,
    paddingVertical: 10,
  },
  cancelButton: {
    alignItems: "center",
  },
  cancelText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
