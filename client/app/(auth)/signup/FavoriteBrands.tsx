import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Button } from "@rneui/themed";

export default function FavoriteBrands() {
  const { gender, age } = useLocalSearchParams();
  const [brands, setBrands] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]); // Added fadeAnim to dependencies

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
    if (brands.length === 0) {
      Alert.alert("brands cannot be empty!");
      return;
    }
    router.push({
      pathname: "/(auth)/signup/OutfitPreferences",
      params: { gender, age, brands: brands.join(",") },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE6E5",
  },
  content: {
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
    height: 40,
    backgroundColor: "#EAE6E5",
    paddingHorizontal: 4,
    marginBottom: 20,
    borderBottomWidth: 0.5,
    borderColor: "#333",
    marginHorizontal: 10,
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
    // backgroundColor: "#EAE6E5",
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
