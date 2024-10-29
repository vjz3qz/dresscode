import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { saveItem } from "@/api/SaveItem";

export default function Camera({
  exitCamera,
  setImageName,
}: {
  exitCamera: () => void;
  setImageName: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const options = { quality: 1, base64: true, exif: true };
        const photo = await cameraRef.current.takePictureAsync(options);
        setPhotoUri(photo.uri);
      } catch (error) {
        console.error("Error taking picture:", error);
      }
    }
  }

  async function uploadPicture() {
    if (photoUri) {
      try {
        const item = { name: "New Item", type: "clothing" };
        const createdItems = await saveItem(item, photoUri);

        if (createdItems && createdItems.length > 0) {
          setImageName(createdItems[0].name || "");
        }
      } catch (error) {
        console.error("Error saving the item:", error);
      }
      exitCamera();
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={exitCamera}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {photoUri ? (
        <>
          <Image source={{ uri: photoUri }} style={styles.preview} />

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.retakeButtonText}>↺</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadPicture}
            >
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.flipButtonText}>⇆</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            />
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  message: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#FFFC",
    padding: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "black",
    fontSize: 16,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
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
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  flipButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  flipButtonText: {
    color: "white",
    fontSize: 18,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    alignSelf: "center",
  },
  preview: {
    flex: 1,
    alignSelf: "stretch",
  },
  actionButton: {
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    marginBottom: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 18,
  },
  preview: {
    flex: 1,
    alignSelf: "stretch",
  },
  actionContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  retakeButton: {
    position: "absolute",
    left: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  retakeButtonText: {
    color: "white",
    fontSize: 24,
  },
  uploadButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: "#FFFC",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "bold",
  },
});
