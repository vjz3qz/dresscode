import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { BACKEND_URL } from "@env";

export default function App() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const options = {
          quality: 1, // Adjust the quality of the picture (0.1 to 1)
          base64: true, // Optionally include the base64 version of the image
          exif: true, // Optionally include EXIF data
        };
        const photo = await cameraRef.current.takePictureAsync(options);

        // Convert the photo to a Blob using the file URI
        const fileUri = photo.uri;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        const fileBlob = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create a FormData object
        const formData = new FormData();
        formData.append("file", {
          uri: fileUri,
          name: "photo.jpg",
          type: "image/jpeg",
        });

        // // Add any other data you want to send with the request
        // formData.append("userId", "12345"); // example of additional data

        const apiUrl = `${BACKEND_URL}/upload`;
        console.log("Sending photo to:", apiUrl);
        // Send the request to the backend
        try {
          const response = await axios.post(apiUrl, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          const result = response.data;
          console.log("Response from backend:", result);
        } catch (error) {
          console.error("Error sending photo:", error);
        }
        // console.log("Photo taken:", photo);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={() => console.log("Camera is ready")}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Take Picture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
