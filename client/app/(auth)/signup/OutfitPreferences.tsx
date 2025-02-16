import React, { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";
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
    <View>
      <Text>What occasions do you mostly need outfits for?</Text>
      <TextInput
        value={preferences}
        onChangeText={setPreferences}
        placeholder="Enter your outfit preferences"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
