import ComingSoonScreen from "@/components/ComingSoon";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
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
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <UploadButton onPress={() => setModalVisible(true)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensure SafeAreaView takes the full screen
  },
  calendar: {},
});
