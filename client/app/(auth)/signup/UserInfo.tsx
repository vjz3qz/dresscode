import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function UserInfo() {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  const handleNext = () => {
    // Navigate to the next page using router
    router.push({
      pathname: "/(auth)/signup/FavoriteBrands",
      params: { gender, age },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What is your gender?</Text>
      <TextInput
        style={styles.input}
        value={gender}
        onChangeText={setGender}
        placeholder="Enter your gender"
      />
      <Text style={styles.label}>How old are you?</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
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
