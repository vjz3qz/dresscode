import { router } from "expo-router";
import ComingSoonScreen from "@/components/ComingSoon";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import UploadButton from "@/ui/UploadButton";
import Modal from "@/ui/Modal";

interface Day {
  year: number;
  month: number;
  day: number;
  timestamp: number;
  dateString: string;
}
export default function CalendarScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <CalendarList
        style={styles.calendar}
        onDayPress={(day: Day) => {
          console.log("selected day", day);
        }}
      />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              router.push("/wardrobe/view/outfitsFeed");
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{"Pick Outfit from Wardrobe"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              router.push("/wardrobe/new/outfit");
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{"Create New Outfit"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log("ootd upload")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{"Upload OOTD"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log("discover new outfits")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{"Discover New Outfits"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <UploadButton onPress={() => setModalVisible(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensure SafeAreaView takes the full screen
  },
  calendar: {},
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgba(104, 143, 229, 0.5)",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 20,
    width: 250, // Fixed width for all buttons
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
