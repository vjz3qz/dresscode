import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { router } from "expo-router";
import { Button, Input } from "@rneui/themed";
import { useKeyboardAvoidingView } from "@/hooks/useKeyboardAvoidingView";

export default function UserInfo() {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const keyboardHeight = useKeyboardAvoidingView();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]); // Added fadeAnim to dependencies

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            { paddingBottom: keyboardHeight, opacity: fadeAnim },
          ]}
        >
          <Text style={styles.title}>Tell Us About Yourself</Text>
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
          <Input
            value={age}
            onChangeText={setAge}
            placeholder="Enter your age"
            keyboardType="numeric"
            containerStyle={styles.inputContainer}
          />
          <Button
            title="Next"
            onPress={handleNext}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
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
  inputContainer: {
    marginBottom: 20,
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
