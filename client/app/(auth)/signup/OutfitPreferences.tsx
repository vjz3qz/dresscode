import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function OutfitPreferences() {
  const { gender, age, brands } = useLocalSearchParams();
  const [preferences, setPreferences] = useState("");

  const handleSubmit = () => {
    // Handle the final submission of user data
    console.log({ gender, age, brands, preferences });
    // You can navigate to a confirmation page or home
    // create the profile in supabase
    router.push("/(app)/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        What occasions do you mostly need outfits for?
      </Text>
      <TextInput
        style={styles.input}
        value={preferences}
        onChangeText={setPreferences}
        placeholder="Enter your outfit preferences"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EAE6E5",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
});
