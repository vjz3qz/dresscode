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
  View,
} from "react-native";
import { router } from "expo-router";
import { Button } from "@rneui/themed";
import { useKeyboardAvoidingView } from "@/hooks/useKeyboardAvoidingView";
import { handleUpdateProfile } from "@/api/CreateProfile";
import Avatar from "@/components/Avatar";
import { useSession } from "@/contexts/SessionContext";

export default function UserInfo() {
  const { session, avatarUrl, setAvatarUrl } = useSession();
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
    if (avatarUrl === "") {
      Alert.alert("avatar cannot be empty!");
      return;
    }
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
          <Text style={styles.title}>Last thing! Upload an Avatar</Text>
          <View style={{ alignItems: "center" }}>
            <Avatar
              size={200}
              url={avatarUrl}
              onUpload={(url: string) => {
                setAvatarUrl(url);
                handleUpdateProfile({ avatar_url: url });
              }}
            />
          </View>
          <Button
            title="Done :)"
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
