import React, { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
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
    <View>
      <Text>What is your gender?</Text>
      <TextInput
        value={gender}
        onChangeText={setGender}
        placeholder="Enter your gender"
      />
      <Text>How old are you?</Text>
      <TextInput
        value={age}
        onChangeText={setAge}
        placeholder="Enter your age"
      />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
