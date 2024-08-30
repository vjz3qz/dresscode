import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function ComingSoonScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://example.com/coming-soon-image.png" }} // Replace with your image URL
        style={styles.image}
      />
      <Text style={styles.title}>Coming Soon!</Text>
      <Text style={styles.subtitle}>
        We are working hard to bring you something amazing. Stay tuned!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
