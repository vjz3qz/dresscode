import React from "react";
import {
  Modal as ReactNativeModal,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ visible, onClose, children }: ModalProps) {
  return (
    <ReactNativeModal
      animationType="slide"
      transparent={false} // Full-screen modal
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <View style={styles.contentContainer}>{children}</View>
      </View>
    </ReactNativeModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white", // Ensures full screen coverage
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contentContainer: {
    width: "100%", // Ensures proper content alignment
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50, // Adjusted for better accessibility
    right: 20,
    padding: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
});
