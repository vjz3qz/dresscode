import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Profile } from "@/types";
import { createProfile } from "@/api/CreateProfile";

export default function OutfitPreferences() {
  const { gender, age, brands } = useLocalSearchParams();
  const [preferences, setPreferences] = useState<string[]>([]);

  const preferenceOptions = [
    { label: "Casual", value: "casual" },
    { label: "Formal", value: "formal" },
    { label: "Sportswear", value: "sportswear" },
    { label: "Party", value: "party" },
    { label: "Business", value: "business" },
  ];

  const handleSubmit = async () => {
    // create profile
    const profile: Profile = {
      gender: gender as string,
      age: age as string,
      brands: Array.isArray(brands) ? brands : [brands].filter(Boolean),
      preferences,
    };

    await createProfile(profile);

    router.push("/(app)/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        What occasions do you mostly need outfits for?
      </Text>
      <MultiSelect
        style={styles.dropdown}
        data={preferenceOptions}
        labelField="label"
        valueField="value"
        placeholder={"Select your outfit preferences"}
        value={preferences}
        onChange={(items) => setPreferences(items)}
        selectedStyle={styles.selectedStyle}
        renderItem={(item, selected) => (
          <View style={styles.itemContainer}>
            <Text>{item.label}</Text>
            {selected && <AntDesign name="check" size={16} color="green" />}
          </View>
        )}
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
  dropdown: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  selectedStyle: {
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
    padding: 5,
    marginTop: 5,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
});
