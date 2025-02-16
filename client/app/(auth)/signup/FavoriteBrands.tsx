import React, { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
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
    <View>
      <Text>What are your favorite fashion brands?</Text>
      <TextInput
        value={brands}
        onChangeText={setBrands}
        placeholder="Type your favorite brands"
      />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}
