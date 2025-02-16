import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { router } from "expo-router";

export default function UserInfo() {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const handleNext = () => {
    router.push({
      pathname: "/(auth)/signup/FavoriteBrands",
      params: { gender, age },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What is your gender?</Text>
      <Dropdown
        style={styles.dropdown}
        data={genderOptions}
        labelField="label"
        valueField="value"
        placeholder="Select gender"
        value={gender}
        onChange={(item) => setGender(item.value)}
      />
      <Text style={styles.label}>How old are you?</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
        keyboardType="numeric"
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
  dropdown: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "#fff",
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
