import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Button } from "@rneui/themed";

export default function FavoriteBrands() {
  const { gender, age } = useLocalSearchParams();
  const [brands, setBrands] = useState<string[]>([]);

  const brandOptions = [
    { label: "Nike", value: "nike" },
    { label: "Adidas", value: "adidas" },
    { label: "Zara", value: "zara" },
    { label: "H&M", value: "hm" },
    { label: "Gucci", value: "gucci" },
    { label: "Uniqlo", value: "uniqlo" },
    { label: "Levi's", value: "levis" },
    { label: "Gap", value: "gap" },
  ];

  const handleNext = () => {
    router.push({
      pathname: "/(auth)/signup/OutfitPreferences",
      params: { gender, age, brands: brands.join(",") },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.keyboardAvoidingView}>
        <Text style={styles.title}>Your Favorite Brands</Text>
        <Text style={styles.subtitle}>Select the brands you love to wear</Text>
        <MultiSelect
          style={styles.dropdown}
          data={brandOptions}
          labelField="label"
          valueField="value"
          placeholder="Select your favorite brands"
          value={brands}
          onChange={(items) => setBrands(items)}
          selectedStyle={styles.selectedStyle}
          renderItem={(item, selected) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.label}</Text>
              {selected && <AntDesign name="check" size={16} color="green" />}
            </View>
          )}
        />
        <Button
          title="Next"
          onPress={handleNext}
          buttonStyle={styles.button}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#EAE6E5",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
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
  itemText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: "#333",
    borderRadius: 25,
    paddingVertical: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
