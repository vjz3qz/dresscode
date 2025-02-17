import { router } from "expo-router";
import React, { useState } from "react";
import { Agenda } from "react-native-calendars";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { supabase } from "@/utils/Supabase";
import type { CalendarEvent } from "@/types";
import { Image } from "expo-image";
import { useSession } from "@/contexts/SessionContext";
import { addImageUrls } from "@/api/FetchImageUrl";
import { format } from "date-fns";
import UploadButton from "@/ui/UploadButton";
import Modal from "@/ui/Modal";
export type ExtendedCalendarEvent = CalendarEvent & {
  outfits?: any; // Adjust the type if you have a more specific definition
};

interface AgendaItems {
  [key: string]: ExtendedCalendarEvent[];
}
export default function CalendarScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<AgendaItems>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  function AddModal() {
    return (
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.buttonContainer}>
          <>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: "/wardrobe/view/outfitsFeed",
                  params: {
                    fromCalendar: "true",
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
        </View>
      </Modal>
    );
  }

  const loadItemsForMonth = async (day: { dateString: string }) => {
    if (!session) return;

    try {
      setLoading(true);

      const currentDate = new Date(day.dateString);

      // Calculate start and end dates for last month, current month, and next month
      const startOfLastMonth = new Date(currentDate);
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1, 1);

      const endOfNextMonth = new Date(currentDate);
      endOfNextMonth.setMonth(endOfNextMonth.getMonth() + 1, 0);

      // Fetch data for the 3-month range
      const { data, error } = await supabase
        .from("calendar_events")
        .select(`*, outfits (*)`)
        .eq("user_id", session.user.id)
        .gte("start_timestamp", startOfLastMonth.toISOString())
        .lte("end_timestamp", endOfNextMonth.toISOString());

      if (error) throw error;

      const newItems: AgendaItems = {};

      // Populate all days in the 3-month range with empty arrays initially
      let iterDate = new Date(startOfLastMonth);
      while (iterDate <= endOfNextMonth) {
        const dateStr = iterDate.toISOString().split("T")[0];
        newItems[dateStr] = []; // Ensure every day is initialized
        iterDate.setDate(iterDate.getDate() + 1);
      }

      if (data.length > 0) {
        const eventsWithUrls = await Promise.all(
          data.map(async (event) => {
            if (event.outfits) {
              const outfitsWithUrls = await addImageUrls(
                [event.outfits],
                session
              );
              return { ...event, outfits: outfitsWithUrls[0] };
            }
            return event;
          })
        );

        // Assign events to the correct days
        eventsWithUrls.forEach((event) => {
          const dateStr = event.start_timestamp.split("T")[0];
          newItems[dateStr].push(event);
        });
      }

      setItems((prev) => ({ ...prev, ...newItems }));
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item: ExtendedCalendarEvent) => {
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => {
          router.push({
            pathname: "/wardrobe/view/outfits/[outfitId]",
            params: { outfitId: item.outfit_id },
          });
        }}
      >
        <View style={styles.eventContent}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>
              {item.event_title || "Planned Outfit"}
            </Text>
            <Text style={styles.eventTime}>
              {item.all_day
                ? "All Day"
                : `${format(
                    new Date(item.start_timestamp),
                    "h:mm a"
                  )} - ${format(new Date(item.end_timestamp ?? ""), "h:mm a")}`}
            </Text>
            {item.location && (
              <Text style={styles.eventLocation}>{item.location}</Text>
            )}
          </View>
          {item.outfits?.image_url && (
            <Image
              source={{ uri: item.outfits.image_url }}
              style={styles.outfitImage}
              contentFit="cover"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItemsForMonth}
        selected={new Date().toISOString().split("T")[0]}
        renderItem={renderItem}
        showClosingKnob={true}
        theme={{
          agendaDayTextColor: "#666",
          agendaDayNumColor: "#666",
          agendaTodayColor: "#688FE5",
          agendaKnobColor: "#688FE5",
          selectedDayBackgroundColor: "#688FE5",
          dotColor: "#688FE5",
          todayTextColor: "#688FE5",
        }}
      />
      {modalVisible && <AddModal />}
      {/* Upload Button */}
      <UploadButton onPress={() => setModalVisible(!modalVisible)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensure SafeAreaView takes the full screen
  },
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
  },
  outfitImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  emptyDate: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "rgba(104, 143, 229, 0.1)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#688FE5",
    fontSize: 14,
    fontWeight: "600",
  },
});
