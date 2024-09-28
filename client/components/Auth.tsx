import React, { useState } from "react";
import { Alert, StyleSheet, View, AppState } from "react-native";
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
      {emailAuth ? (
        <>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              label="Email"
              leftIcon={{ type: "font-awesome", name: "envelope" }}
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize={"none"}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Input
              label="Password"
              leftIcon={{ type: "font-awesome", name: "lock" }}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize={"none"}
            />
          </View>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Button
              title="Sign in"
              disabled={loading}
              onPress={() => signInWithEmail()}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              title="Sign up"
              disabled={loading}
              onPress={() => signUpWithEmail()}
            />
          </View>
        </>
      ) : (
        <>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              label="Phone"
              leftIcon={{ type: "font-awesome", name: "phone" }}
              onChangeText={(text) => setPhone(text)}
              value={phone}
              placeholder="+1234567890"
              autoCapitalize={"none"}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              title="Sign up with Phone"
              disabled={loading}
              onPress={() => signUpWithPhone()}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Input
              label="OTP"
              leftIcon={{ type: "font-awesome", name: "key" }}
              onChangeText={(text) => setOtp(text)}
              value={otp}
              placeholder="Enter OTP"
              autoCapitalize={"none"}
            />
          </View>
          <View style={styles.verticallySpaced}>
            <Button
              title="Verify OTP"
              disabled={loading}
              onPress={() => verifyOtp()}
            />
          </View>
        </>
      )}
      <View style={styles.verticallySpaced}>
        <Button
          title={emailAuth ? "Sign up with Phone" : "Sign up with Email"}
          disabled={loading}
          onPress={() => setEmailAuth(!emailAuth)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
