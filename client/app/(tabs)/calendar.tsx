import ComingSoonScreen from "@/components/ComingSoon";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";

interface Day {
  year: number;
  month: number;
  day: number;
  timestamp: number;
  dateString: string;
}
export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <CalendarList
        style={styles.calendar}
        onDayPress={(day: Day) => {
          console.log("selected day", day);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensure SafeAreaView takes the full screen
  },
  calendar: {},
});
