import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import axios from "axios";

export default function Camera({
  exitCamera,
  setImageName,
}: {
  exitCamera: () => void;
  setImageName: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null); // State to hold the photo URI
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

        // Save the photo URI to state
        setPhotoUri(photo.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  }

  async function uploadPicture() {
    if (photoUri) {
      try {
        // Create a FormData object
        const formData = new FormData();
        formData.append("file", {
          uri: photoUri,
          name: "photo.jpg",
          type: "image/jpeg",
        });
        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const apiUrl = `${BACKEND_URL}/upload`;
        console.log("Sending photo to:", apiUrl);

        // Send the request to the backend to upload the image
        const response = await axios.post(apiUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const result = response.data;
        console.log("Response from backend:", result);

        // Assuming the backend returns the filename of the uploaded image
        const filename = result["result"]["filename"];
        setImageName(filename);
      } catch (error) {
        console.error("Error sending photo:", error);
      }
      exitCamera();
    }
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={exitCamera}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Button title="Upload Picture" onPress={uploadPicture} />
          <Button title="Retake Picture" onPress={() => setPhotoUri(null)} />
        </>
      ) : (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
          onCameraReady={() => console.log("Camera is ready")}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Take Picture</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
  preview: {
    flex: 1,
    alignSelf: "stretch",
  },
});