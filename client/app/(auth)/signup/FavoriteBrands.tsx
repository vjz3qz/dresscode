import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function FavoriteBrands() {
  const { gender, age } = useLocalSearchParams();
  const [brands, setBrands] = useState("");

  const handleNext = () => {
    // Navigate to the next page using router
    router.push({
      pathname: "/(auth)/signup/OutfitPreferences",
      params: { gender, age, brands },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What are your favorite fashion brands?</Text>
      <TextInput
        style={styles.input}
        value={brands}
        onChangeText={setBrands}
        placeholder="Type your favorite brands"
      />
      <Button title="Next" onPress={handleNext} />
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
