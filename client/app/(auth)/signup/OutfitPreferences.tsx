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
import type { Profile } from "@/types";
import { createProfile } from "@/api/CreateProfile";

export default function OutfitPreferences() {
  const { gender, age, brands } = useLocalSearchParams();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]); // Added fadeAnim to dependencies

  const preferenceOptions = [
    { label: "Casual", value: "casual" },
    { label: "Formal", value: "formal" },
    { label: "Sportswear", value: "sportswear" },
    { label: "Party", value: "party" },
    { label: "Business", value: "business" },
    { label: "Vintage", value: "vintage" },
    { label: "Streetwear", value: "streetwear" },
    { label: "Bohemian", value: "bohemian" },
  ];

  const handleSubmit = async () => {
    if (preferences.length === 0) {
      Alert.alert("preferences cannot be empty!");
      return;
    }
    router.push({
      pathname: "/(auth)/signup/UserInfo",
      params: {
        gender,
        age,
        brands: Array.isArray(brands) ? brands.join(",") : "",
        preferences,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Your Style Preferences</Text>
        <Text style={styles.subtitle}>
          What occasions do you mostly need outfits for?
        </Text>
        <MultiSelect
          style={styles.dropdown}
          data={preferenceOptions}
          labelField="label"
          valueField="value"
          placeholder="Select your outfit preferences"
          value={preferences}
          onChange={(items) => setPreferences(items)}
          selectedStyle={styles.selectedStyle}
          renderItem={(item, selected) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.label}</Text>
              {selected && <AntDesign name="check" size={16} color="green" />}
            </View>
          )}
        />
        <Button
          title="Complete Profile"
          onPress={handleSubmit}
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
