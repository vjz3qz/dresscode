import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/utils/Supabase";
import { useSession } from "@/contexts/SessionContext";
import type { CalendarEvent, Outfit } from "@/types";
import { fetchCalendarEventById } from "@/api/fetchCalendarEvents";
import { fetchImageUrl } from "@/api/FetchImageUrl";
import { fetchOutfitById } from "@/api/fetchOutfits";
import { format } from "date-fns";

const { width } = Dimensions.get("window");

export default function EventScreen() {
  const { session } = useSession();
  const { calendarEventId } = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const fetchedCalendarEvent: CalendarEvent =
          await fetchCalendarEventById(
            Array.isArray(calendarEventId)
              ? calendarEventId[0]
              : calendarEventId
          );
        setCalendarEvent(fetchedCalendarEvent);
        const fetchedStartDate = new Date(fetchedCalendarEvent.start_timestamp);
        setStartDate(fetchedStartDate);
        if (fetchedCalendarEvent.all_day) {
          setIsAllDay(true);
        } else {
          const fetchedEndDate = new Date(
            fetchedCalendarEvent.end_timestamp ?? ""
          );
          setEndDate(fetchedEndDate);
        }
        setTitle(fetchedCalendarEvent.event_title ?? "");
        setNotes(fetchedCalendarEvent.notes ?? "");
        setLocation(fetchedCalendarEvent.location ?? "");
        const outfitId = fetchedCalendarEvent.outfit_id;

        const fetchedOutfit = await fetchOutfitById(outfitId);
        // get outfit image url
        if (!fetchedOutfit.image_key) return;
        if (!session) return;
        fetchedOutfit.image_url = await fetchImageUrl(
          fetchedOutfit.image_key || ""
        );
        setOutfit(fetchedOutfit);
      } catch (error: any) {
        console.error("Error fetching calendar event:", error.message);
        Alert.alert("Error", "Failed to load event details. Please try again.");
      } finally {
        setLoading(false);

        // Start animations after loading
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    loadEvent();
  }, [calendarEventId, session]);

  const handleSave = async () => {
    if (!session) return;

    setSaving(true);
    try {
      const adjustedStartDate = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      );
      const adjustedEndDate = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000
      );

      const { error } = await supabase.from("calendar_events").update({
        id: calendarEventId,
        user_id: session.user.id,
        outfit_id: outfit?.id,
        event_title: title,
        start_timestamp: adjustedStartDate.toISOString(), // Local time with offset
        end_timestamp: adjustedEndDate.toISOString(),
        all_day: isAllDay,
        location,
        notes,
      });

      if (error) throw error;

      Alert.alert("Success", "Event updated successfully!", [
        { text: "OK", onPress: () => router.replace("/(app)/(tabs)/calendar") },
      ]);
    } catch (error: any) {
      console.error("Error updating event:", error.message);
      Alert.alert("Error", "Failed to update event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onStartDateChange = (event: any, selectedStartDate?: Date) => {
    setShowStartPicker(false);
    if (selectedStartDate) {
      setStartDate(selectedStartDate);
      if (selectedStartDate > endDate) {
        setEndDate(selectedStartDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedEndDate?: Date) => {
    setShowEndPicker(false);
    if (selectedEndDate) {
      setEndDate(selectedEndDate);
      if (selectedEndDate < startDate) {
        setStartDate(selectedEndDate);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              <Ionicons name="save-outline" size={24} color="#333" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Outfit Image */}
          {outfit && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: outfit.image_url }}
                style={styles.outfitImage}
                contentFit="cover"
                transition={300}
              />
              <TouchableOpacity
                style={styles.outfitButton}
                onPress={() => {
                  if (outfit.id) {
                    router.push(`/view/wardrobe/outfits/${outfit.id}`);
                  }
                }}
              >
                <Text style={styles.outfitButtonText}>View Outfit</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Event Details Card */}
          <View style={styles.detailsCard}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color="#333"
                style={styles.titleIcon}
              />
              <TextInput
                style={styles.titleInput}
                placeholder="Add Event Title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#999"
              />
            </View>

            {/* All Day Toggle */}
            <View style={styles.sectionRow}>
              <View style={styles.labelContainer}>
                <Ionicons
                  name="time-outline"
                  size={22}
                  color="#666"
                  style={styles.rowIcon}
                />
                <Text style={styles.label}>All Day</Text>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: "#e0e0e0", true: "#333" }}
                thumbColor={"#fff"}
              />
            </View>

            {/* Date Time Selectors */}
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateTimeLabel}>Starts</Text>
                {/* <Text style={styles.dateTimeValue}>
                  {isAllDay
                    ? format(startDate, "EEE, MMM d, yyyy")
                    : format(startDate, "EEE, MMM d, yyyy h:mm a")}
                </Text> */}

                <DateTimePicker
                  value={startDate}
                  mode={isAllDay ? "date" : "datetime"}
                  is24Hour={false}
                  onChange={onStartDateChange}
                  display="default"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeRow}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.dateTimeLabel}>Ends</Text>
                {/* <Text style={styles.dateTimeValue}>
                  {isAllDay
                    ? format(endDate, "EEE, MMM d, yyyy")
                    : format(endDate, "EEE, MMM d, yyyy h:mm a")}
                </Text> */}
                <DateTimePicker
                  value={endDate}
                  mode={isAllDay ? "date" : "datetime"}
                  is24Hour={false}
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                  display="default"
                />
              </TouchableOpacity>

              {/* {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode={isAllDay ? "date" : "datetime"}
                  is24Hour={false}
                  onChange={onStartDateChange}
                  display="default"
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode={isAllDay ? "date" : "datetime"}
                  is24Hour={false}
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                  display="default"
                />
              )} */}
            </View>

            {/* Location */}
            <View style={styles.inputRow}>
              <Ionicons
                name="location-outline"
                size={22}
                color="#666"
                style={styles.rowIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Add Location"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#999"
              />
            </View>

            {/* Notes */}
            <View style={styles.notesContainer}>
              <View style={styles.notesHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#666"
                  style={styles.rowIcon}
                />
                <Text style={styles.notesLabel}>Notes</Text>
              </View>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes about this event..."
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 15,
    position: "relative",
  },
  outfitImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 20,
    backgroundColor: "white",
  },
  outfitButton: {
    position: "absolute",
    bottom: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  outfitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 15,
    marginBottom: 15,
  },
  titleIcon: {
    marginRight: 10,
  },
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  dateTimeContainer: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 10,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  dateTimeLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dateTimeValue: {
    fontSize: 16,
    color: "#666",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  notesContainer: {
    marginTop: 15,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  notesInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
  },
  spacer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAE6E5",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
});
