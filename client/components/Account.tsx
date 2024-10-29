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

export default function Account() {
  const { session, username, setUsername, avatarUrl, setAvatarUrl, loading } =
    useSession();
  const [updateProfilePage, setUpdateProfilePage] = useState(false);

  function UpdateProfile({
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
            onPress={() =>
              handleUpdateProfile({ username, avatar_url: avatarUrl })
            }
            disabled={loading}
          />
        </View>
        <TouchableOpacity
          style={[styles.verticallySpaced, styles.mt20]}
          onPress={() => setUpdateProfilePage(false)}
        >
          <Text style={{ color: "#007AFF" }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleUpdateProfile({
    username,
    avatar_url,
  }: {
    username: string;
    avatar_url: string;
  }) {
    try {
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  return updateProfilePage ? (
    <UpdateProfile
      username={username}
      setUsername={setUsername}
      avatarUrl={avatarUrl}
    />
  ) : (
    <View style={styles.container}>
      <Image
        source={{ uri: avatarUrl || "https://via.placeholder.com/80" }}
        style={styles.avatar}
      />
      <Text style={styles.nameText}>{username || "Name"}</Text>
      <Text style={styles.usernameText}>@{username || "name"}</Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setUpdateProfilePage(true)}
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
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EAE6E5",
    marginBottom: 10,
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
});
