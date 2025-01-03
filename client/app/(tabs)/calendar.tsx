import ComingSoonScreen from "@/components/ComingSoon";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet, Text } from "react-native";
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
        <Text style={styles.modalText}>Upload Content</Text>
        {/* Add your upload content here */}
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
});
