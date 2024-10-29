import React, { useState } from "react";
import { Alert, StyleSheet, View, AppState, Text, Image } from "react-native";
import { supabase } from "@/utils/Supabase";
import { Button, Input } from "@rneui/themed";

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

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    else if (!session)
      Alert.alert("Please check your inbox for email verification!");
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
    else if (!session) Alert.alert("Please check your phone for the OTP!");
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
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to</Text>
      <Image
        source={require("@/assets/images/title.png")}
        style={styles.brandImage}
      />

      {emailAuth ? (
        <>
          <Input
            label="Email"
            leftIcon={{ type: "font-awesome", name: "envelope" }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Enter your email"
            autoCapitalize={"none"}
            containerStyle={styles.inputContainer}
          />
          <Input
            label="Password"
            leftIcon={{ type: "font-awesome", name: "lock" }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Enter your password"
            autoCapitalize={"none"}
            containerStyle={styles.inputContainer}
          />
          <Button
            title="Sign In"
            disabled={loading}
            onPress={() => signInWithEmail()}
            buttonStyle={styles.signInButton}
            containerStyle={styles.buttonContainer}
          />
          <Button
            title="Sign Up"
            disabled={loading}
            onPress={() => signUpWithEmail()}
            buttonStyle={styles.signInButton}
            containerStyle={styles.buttonContainer}
          />
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </>
      ) : (
        <>{/* Additional phone authentication fields if needed */}</>
      )}
      <Button
        title="Sign in with Google"
        disabled={loading}
        buttonStyle={styles.socialButton}
        icon={{ name: "google", type: "font-awesome", color: "white" }}
      />
      <Button
        title="Sign in with Phone"
        disabled={loading}
        buttonStyle={styles.socialButton}
        icon={{ name: "phone", type: "font-awesome", color: "white" }}
        containerStyle={{ marginTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAE6E5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  brandImage: {
    width: 250, // Adjust width to fit your design
    height: 60, // Adjust height based on image aspect ratio
    resizeMode: "contain",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  signInButton: {
    backgroundColor: "#333",
    borderRadius: 5,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 10,
  },
  forgotPassword: {
    color: "gray",
    marginTop: 10,
    marginBottom: 30,
    textDecorationLine: "underline",
  },
  socialButton: {
    backgroundColor: "#333",
    borderRadius: 5,
    width: "100%",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
});

// (
//   <>
//     <View style={[styles.verticallySpaced, styles.mt20]}>
//       <Input
//         label="Phone"
//         leftIcon={{ type: "font-awesome", name: "phone" }}
//         onChangeText={(text) => setPhone(text)}
//         value={phone}
//         placeholder="+1234567890"
//         autoCapitalize={"none"}
//       />
//     </View>
//     <View style={styles.verticallySpaced}>
//       <Button
//         title="Sign up with Phone"
//         disabled={loading}
//         onPress={() => signUpWithPhone()}
//       />
//     </View>
//     <View style={styles.verticallySpaced}>
//       <Input
//         label="OTP"
//         leftIcon={{ type: "font-awesome", name: "key" }}
//         onChangeText={(text) => setOtp(text)}
//         value={otp}
//         placeholder="Enter OTP"
//         autoCapitalize={"none"}
//       />
//     </View>
//     <View style={styles.verticallySpaced}>
//       <Button
//         title="Verify OTP"
//         disabled={loading}
//         onPress={() => verifyOtp()}
//       />
//     </View>
//   </>
// )
