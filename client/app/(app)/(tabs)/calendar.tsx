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

  const loadItems = async (day: { dateString: string }) => {
    if (!session) return;

    try {
      setLoading(true);
      const startOfMonth = new Date(day.dateString);
      startOfMonth.setDate(1);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);

      const { data, error } = await supabase
        .from("calendar_events")
        .select(`*, outfits (*)`) // selecting the outfit for that event as well
        .eq("user_id", session.user.id)
        .gte("start_timestamp", startOfMonth.toISOString())
        .lte("end_timestamp", endOfMonth.toISOString());

      if (error) throw error;

      // Group events by date
      const newItems: AgendaItems = {};
      if (data) {
        // Add image URLs to outfits
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

        // Group events by date
        eventsWithUrls.forEach((event) => {
          const dateStr = event.start_timestamp.split("T")[0];
          if (!newItems[dateStr]) {
            newItems[dateStr] = [];
          }
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

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            router.push({
              pathname: "/wardrobe/view/outfitsFeed",
              params: {
                fromCalendar: "true",
                selectedDate: new Date().toISOString().split("T")[0],
              },
            });
          }}
        >
          <Text style={styles.addButtonText}>Plan Outfit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={new Date().toISOString().split("T")[0]}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        showClosingKnob={true}
        pastScrollRange={2}
        futureScrollRange={2}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
