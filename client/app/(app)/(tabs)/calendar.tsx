import { router } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import { Agenda } from "react-native-calendars";
import {
  // SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { supabase } from "@/utils/Supabase";
import type { CalendarEvent } from "@/types";
import { Image } from "expo-image";
import { useSession } from "@/contexts/SessionContext";
import { addImageUrls } from "@/api/FetchImageUrl";
import { format } from "date-fns";
import UploadButton from "@/ui/UploadButton";
import Modal from "@/ui/Modal";
import { Ionicons } from "@expo/vector-icons";

export type ExtendedCalendarEvent = CalendarEvent & {
  outfits?: any;
};

interface AgendaItems {
  [key: string]: ExtendedCalendarEvent[];
}

export default function CalendarScreen() {
  const { session } = useSession();
  const [items, setItems] = useState<AgendaItems>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    // Load initial data
    const today = new Date().toISOString().split("T")[0];
    loadItemsForMonth({ dateString: today });
  }, [fadeAnim]);

  function AddModal() {
    return (
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add to Calendar</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: "/view/wardrobe/outfitsGridView",
                  params: {
                    fromCalendar: "true",
                  },
                });
              }}
              style={styles.modalButton}
            >
              <Ionicons
                name="shirt-outline"
                size={24}
                color="#333"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Pick Outfit from Wardrobe</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                router.push({
                  pathname: "/new/wardrobe/outfit",
                  params: {
                    fromCalendar: "true",
                  },
                });
              }}
              style={styles.modalButton}
            >
              <Ionicons
                name="create-outline"
                size={24}
                color="#333"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Create New Outfit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => console.log("ootd upload")}
              style={styles.modalButton}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color="#333"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Upload OOTD</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => console.log("discover new outfits")}
              style={styles.modalButton}
            >
              <Ionicons
                name="search-outline"
                size={24}
                color="#333"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Discover New Outfits</Text>
            </TouchableOpacity>
          </View>
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
      const iterDate = new Date(startOfLastMonth);
      while (iterDate <= endOfNextMonth) {
        const dateStr = iterDate.toISOString().split("T")[0];
        newItems[dateStr] = []; // Ensure every day is initialized
        iterDate.setDate(iterDate.getDate() + 1);
      }

      if (data.length > 0) {
        const eventsWithUrls = await Promise.all(
          data.map(async (event) => {
            if (event.outfits) {
              const outfitsWithUrls = await addImageUrls([event.outfits]);
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
      setRefreshing(false);
    }
  };

  const refreshItems = async () => {
    setRefreshing(true);
    const today = new Date().toISOString().split("T")[0];
    await loadItemsForMonth({ dateString: today });
  };

  const renderItem = (calendarEvent: ExtendedCalendarEvent) => {
    if (!calendarEvent) return <></>;
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => {
          router.push({
            pathname: "/view/calendarEvents/[calendarEventId]",
            params: { calendarEventId: calendarEvent.id ?? "" },
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.eventContent}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>
              {calendarEvent.event_title || "Planned Outfit"}
            </Text>
            <Text style={styles.eventTime}>
              {calendarEvent.all_day
                ? "All Day"
                : `${format(
                    new Date(calendarEvent.start_timestamp),
                    "h:mm a"
                  )} - ${format(
                    new Date(calendarEvent.end_timestamp ?? ""),
                    "h:mm a"
                  )}`}
            </Text>
            {calendarEvent.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.eventLocation}>
                  {calendarEvent.location}
                </Text>
              </View>
            )}
          </View>
          {calendarEvent.outfits?.image_url && (
            <Image
              source={{ uri: calendarEvent.outfits.image_url }}
              style={styles.outfitImage}
              contentFit="cover"
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text style={styles.emptyDateText}>No outfits planned</Text>
      </View>
    );
  };

  return (
    <>
      {/* Header with top safe area */}
      <SafeAreaView style={{ backgroundColor: "#EAE6E5" }} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Outfit Calendar</Text>
          <TouchableOpacity onPress={refreshItems} style={styles.refreshButton}>
            {refreshing ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <Ionicons name="refresh-outline" size={24} color="#333" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Agenda container without extra top padding */}
      <View style={{ flex: 1, backgroundColor: "#EAE6E5" }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <Agenda
            items={items}
            loadItemsForMonth={loadItemsForMonth}
            selected={new Date().toISOString().split("T")[0]}
            renderItem={renderItem}
            renderEmptyDate={renderEmptyDate}
            showClosingKnob={true}
            theme={{
              backgroundColor: "#EAE6E5",
              calendarBackground: "#EAE6E5",
              agendaKnobColor: "#333",
              selectedDayBackgroundColor: "#333",
              dotColor: "#333",
              todayTextColor: "#333",
              agendaDayTextColor: "#333",
              agendaDayNumColor: "#333",
              agendaTodayColor: "#333",
              monthTextColor: "#333",
              textSectionTitleColor: "#333",
              textDisabledColor: "#999",
              dayTextColor: "#333",
              textMonthFontWeight: "bold",
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />
        </Animated.View>

        {modalVisible && <AddModal />}

        {/* Upload Button */}
        <UploadButton onPress={() => setModalVisible(!modalVisible)} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAE6E5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalContent: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAE6E5",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    width: "100%",
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  eventContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  outfitImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  emptyDate: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    marginRight: 16,
    marginVertical: 8,
  },
  emptyDateText: {
    color: "#666",
    fontSize: 14,
  },
});
