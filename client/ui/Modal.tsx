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
  transparent?: boolean; // Optional prop with default value
}

export default function Modal({
  visible,
  onClose,
  children,
  transparent = false,
}: ModalProps) {
  return (
    <ReactNativeModal
      animationType="slide"
      transparent={transparent}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          transparent && styles.transparentBackground,
        ]}
      >
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
        <View style={styles.contentContainer}>
          <View style={[transparent && styles.modalView]}>{children}</View>
        </View>
      </View>
    </ReactNativeModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "white", // Default full-screen modal
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  transparentBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background when transparent is true
  },
  contentContainer: {
    width: "100%", // Ensures proper content alignment
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
