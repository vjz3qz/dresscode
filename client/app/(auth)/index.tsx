import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  Text,
  Image,
  ScrollView,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { supabase } from "@/utils/Supabase";
import { Button, Input } from "@rneui/themed";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useKeyboardAvoidingView } from "@/hooks/useKeyboardAvoidingView";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) Alert.alert(error.message);
}

export default function Auth() {
  const [emailAuth, setEmailAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
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

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
    if (!error) router.replace("/(app)/(tabs)");
  }

  async function signUpWithEmail() {
    if (email === "") {
      Alert.alert("email cannot be empty!");
      return;
    }
    if (password === "") {
      Alert.alert("password cannot be empty!");
      return;
    }
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    // else if (!session)
    //   Alert.alert("Please check your inbox for email verification!");
    router.push("/(auth)/signup/UserInfo");
    setLoading(false);
  }

  async function signUpWithPhone() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) Alert.alert(error.message);
    // else if (!session) Alert.alert("Please check your phone for the OTP!");
    setLoading(false);
  }

  async function verifyOtp() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: "sms",
    });

    if (error) Alert.alert(error.message);
    else if (session) Alert.alert("Phone verified!");
    setLoading(false);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: keyboardHeight },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("@/assets/images/title.png")}
            style={styles.brandImage}
          />
          <Text style={styles.subtitle}>Your Personal Style Assistant</Text>

          <Input
            leftIcon={<Ionicons name="mail-outline" size={24} color="#333" />}
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={styles.inputContainer}
          />
          <Input
            leftIcon={
              <Ionicons name="lock-closed-outline" size={24} color="#333" />
            }
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            placeholder="Password"
            autoCapitalize="none"
            containerStyle={styles.inputContainer}
          />

          <Button
            title="Sign In"
            loading={loading}
            onPress={signInWithEmail}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
          <Button
            title="Sign Up"
            loading={loading}
            onPress={signUpWithEmail}
            buttonStyle={[styles.button, styles.signUpButton]}
            containerStyle={styles.buttonContainer}
          />

          <Text style={styles.orText}>or</Text>

          <Button
            title="Sign in with Google"
            icon={
              <Ionicons
                name="logo-google"
                size={24}
                color="white"
                style={styles.socialIcon}
              />
            }
            buttonStyle={[styles.button, styles.googleButton]}
            containerStyle={styles.buttonContainer}
          />
          <Button
            title="Sign in with Apple"
            icon={
              <Ionicons
                name="logo-apple"
                size={24}
                color="white"
                style={styles.socialIcon}
              />
            }
            buttonStyle={[styles.button, styles.appleButton]}
            containerStyle={styles.buttonContainer}
          />

          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </ScrollView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE6E5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  brandImage: {
    width: 200,
    height: 50,
    resizeMode: "contain",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#333",
    borderRadius: 25,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: "#4A90E2",
  },
  orText: {
    fontSize: 16,
    color: "#666",
    marginVertical: 15,
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  socialIcon: {
    marginRight: 10,
  },
  forgotPassword: {
    color: "#4A90E2",
    marginTop: 15,
    textDecorationLine: "underline",
  },
});
