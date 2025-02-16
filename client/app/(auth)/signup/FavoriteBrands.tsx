import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

export default function FavoriteBrands() {
  const { gender, age } = useLocalSearchParams();
  const [brands, setBrands] = useState<string[]>([]);

  const brandOptions = [
    { label: "Nike", value: "nike" },
    { label: "Adidas", value: "adidas" },
    { label: "Zara", value: "zara" },
    { label: "H&M", value: "hm" },
    { label: "Gucci", value: "gucci" },
  ];

  const handleNext = () => {
    router.push({
      pathname: "/(auth)/signup/OutfitPreferences",
      params: { gender, age, brands: brands.join(",") },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>What are your favorite fashion brands?</Text>
      <MultiSelect
        style={styles.dropdown}
        data={brandOptions}
        labelField="label"
        valueField="value"
        placeholder={"Select your favorite brands"}
        value={brands}
        onChange={(items: string[]) => setBrands(items)}
        selectedStyle={styles.selectedStyle}
        renderItem={(item, selected) => (
          <View style={styles.itemContainer}>
            <Text>{item.label}</Text>
            {selected && <AntDesign name="check" size={16} color="green" />}
          </View>
        )}
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
