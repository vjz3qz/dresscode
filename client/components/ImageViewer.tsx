import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import axios from "axios";

export default function ImageViewer({
  imageName,
  setImageName,
}: {
  imageName: string;
  setImageName: (imageName: string) => void;
}) {
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
        imageUrl && (
          <>
            {/* X button to close the gallery */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageName("")}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Image source={{ uri: imageUrl }} style={styles.image} />
          </>
        )
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
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
