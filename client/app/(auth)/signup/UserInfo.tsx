import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Input } from "@rneui/themed";
import { useKeyboardAvoidingView } from "@/hooks/useKeyboardAvoidingView";
import { Profile } from "@/types";
import { createProfile } from "@/api/CreateProfile";

export default function UserInfo() {
  const { gender, age, brands, preferences } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const keyboardHeight = useKeyboardAvoidingView();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]); // Added fadeAnim to dependencies

  const handleNext = async () => {
    if (name === "") {
      Alert.alert("name cannot be empty!");
      return;
    }
    if (username === "") {
      Alert.alert("username cannot be empty!");
      return;
    }
    const profile: Profile = {
      gender: gender as string,
      age: Number(age),
      brands: Array.isArray(brands) ? brands : [brands].filter(Boolean),
      preferences: Array.isArray(preferences)
        ? preferences
        : [preferences].filter(Boolean),
      display_name: name,
      username,
    };

    await createProfile(profile);
    router.push("/(app)/(tabs)");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            { paddingBottom: keyboardHeight, opacity: fadeAnim },
          ]}
        >
          <Text style={styles.title}>Finish up creating your profile</Text>
          <Text style={styles.label}>What is your name?</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            containerStyle={styles.inputContainer}
          />
          <Text style={styles.label}>What is your username?</Text>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            containerStyle={styles.inputContainer}
          />
          <Button
            title="Next"
            onPress={handleNext}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
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
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#333",
    borderRadius: 25,
    paddingVertical: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
