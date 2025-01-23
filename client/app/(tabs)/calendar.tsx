import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { Calendar, CalendarList } from "react-native-calendars";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { supabase } from "@/utils/Supabase";
import type { CalendarEvent, Outfit } from "@/types";
import Modal from "@/ui/Modal";
import { Image } from "expo-image";
import { useSession } from "@/contexts/SessionContext";
import { addImageUrls } from "@/api/FetchImageUrl";

interface Day {
  year: number;
  month: number;
  day: number;
  timestamp: number;
  dateString: string;
}

export default function CalendarScreen() {
  const { session } = useSession();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendarEvents = async (date: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("calendar_events")
        .select(`*, outfits (*)`) // selecting the outfit for that event as well
        .gte("start_timestamp", `${date}T00:00:00`) // Start of day
        .lte("end_timestamp", `${date}T23:59:59`); // End of day

      // if data, get all the outfits
      let fetchedOutfits = [];
      if (data) {
        fetchedOutfits = data.flatMap((event) => event.outfits || []);
        // fetch image urls for each outfit
        if (!session) return;
        fetchedOutfits = await addImageUrls(fetchedOutfits, session);
        setOutfits(fetchedOutfits);
      }

      if (error) throw error;
      setCalendarEvents(data || []);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = async (day: Day) => {
    setSelectedDay(day);
    await fetchCalendarEvents(day.dateString);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CalendarList style={styles.calendar} onDayPress={handleDayPress} />
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.buttonContainer}>
          {loading ? (
            <Text>Loading...</Text>
          ) : calendarEvents.length > 0 ? (
            // Display calendar events if they exist
            calendarEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => {
                  // Navigate to outfit details
                  setModalVisible(false);
                  router.push({
                    pathname: "/wardrobe/view/outfits/[outfitId]",
                    params: { outfitId: event.outfit_id },
                  });
                }}
              >
                <Text style={styles.eventTitle}>
                  {event.event_title || "Planned Outfit"}
                </Text>
                <Text style={styles.eventType}>{event.event_type}</Text>

                <Image
                  source={{
                    uri:
                      outfits.find((outfit) => outfit.id === event.outfit_id)
                        ?.image_url || "",
                  }}
                  style={styles.image}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))
          ) : (
            // Show regular buttons if no events exist
            <>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  router.push({
                    pathname: "/wardrobe/view/outfitsFeed",
                    params: {
                      fromCalendar: "true",
                      selectedDate: selectedDay?.dateString,
                    },
                  });
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Pick Outfit from Wardrobe</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  router.push({
                    pathname: "/wardrobe/new/outfit",
                    params: {
                      fromCalendar: "true",
                      selectedDate: selectedDay?.dateString,
                    },
                  });
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Create New Outfit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log("ootd upload")}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Upload OOTD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log("discover new outfits")}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Discover New Outfits</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
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
  eventCard: {
    backgroundColor: "rgba(104, 143, 229, 0.5)",
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    width: "90%",
  },
  eventTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventType: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
  },
  image: {
    width: 200,
    height: 200,
  },
});
