import React, { useEffect, useState } from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";

export default function ImageViewer({ imageName }: { imageName: string }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!imageName) {
        return;
      }

      try {
        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const response = await axios.get(
          `${BACKEND_URL}/get-image-url/${imageName}`
        );

        setImageUrl(response.data["result"]["url"]);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImageUrl();
  }, [imageName]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
});
