import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Clock, MapPin, AlignLeft } from "lucide-react-native";
import { supabase } from "@/utils/Supabase";
import { useSession } from "@/contexts/SessionContext";
import { Outfit } from "@/types";
import { fetchOutfitById } from "@/api/fetchOutfits";
import { fetchImageUrl } from "@/api/FetchImageUrl";

export default function CreateEventScreen() {
  const { session } = useSession();
  const { outfitId } = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOutfit = async () => {
      setLoading(true);
      try {
        let fetchedOutfit = await fetchOutfitById(
          Array.isArray(outfitId) ? outfitId[0] : outfitId
        );
        // get outfit image url
        if (!fetchedOutfit.s3_key) return;
        if (!session) return;
        fetchedOutfit.image_url = await fetchImageUrl(
          fetchedOutfit.s3_key || "",
          session
        );
        setOutfit(fetchedOutfit);
      } catch (error: any) {
        console.error("Error fetching outfit:", error.message);
        setOutfit(null);
      } finally {
        setLoading(false);
      }
    };

    loadOutfit();
  }, []);

  const handleSave = async () => {
    if (!session) return;

    try {
      const adjustedStartDate = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      );
      const adjustedEndDate = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000
      );

      const { error } = await supabase.from("calendar_events").insert({
        user_id: session.user.id,
        outfit_id: outfitId,
        event_title: title,
        start_timestamp: adjustedStartDate.toISOString(), // Local time with offset
        end_timestamp: adjustedEndDate.toISOString(),
        all_day: isAllDay,
        location,
        notes,
      });

      if (error) throw error;

      router.replace("/(app)/(tabs)/calendar");
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const onStartDateChange = (event: any, selectedStartDate?: Date) => {
    if (selectedStartDate) {
      setStartDate(selectedStartDate);
      if (selectedStartDate > endDate) {
        setEndDate(selectedStartDate);
      }
    }
  };

  const onEndDateChange = (event: any, selectedEndDate?: Date) => {
    if (selectedEndDate) {
      setEndDate(selectedEndDate);
      if (selectedEndDate < startDate) {
        setStartDate(selectedEndDate);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {outfit && (
          <Image
            source={{ uri: outfit.image_url }}
            style={styles.outfitImage}
            contentFit="contain"
          />
        )}

        <TextInput
          style={styles.titleInput}
          placeholder="Add Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />

        <View style={styles.section}>
          <View style={styles.row}>
            <Clock size={24} color="#666" />
            <Text style={styles.label}>All Day</Text>
            <Switch
              value={isAllDay}
              onValueChange={setIsAllDay}
              style={styles.switch}
            />
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{"Start Date"}</Text>
            <DateTimePicker
              value={startDate}
              mode={isAllDay ? "date" : "datetime"}
              is24Hour={false}
              onChange={onStartDateChange}
            />
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{"End Date"}</Text>

            <DateTimePicker
              value={endDate}
              mode={isAllDay ? "date" : "datetime"}
              is24Hour={false}
              onChange={onEndDateChange}
              minimumDate={startDate}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <MapPin size={24} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Add Location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <AlignLeft size={24} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Add Notes"
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor="#999"
              multiline
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cancelButton: {
    fontSize: 17,
    color: "#007AFF",
  },
  saveButton: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  outfitImage: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  section: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 17,
    marginLeft: 12,
    flex: 1,
  },
  switch: {
    marginLeft: "auto",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  dateText: {
    fontSize: 17,
    color: "#000",
  },
  timeText: {
    fontSize: 17,
    color: "#007AFF",
  },
  input: {
    flex: 1,
    fontSize: 17,
    marginLeft: 12,
  },
});
