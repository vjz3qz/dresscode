import { CalendarEvent } from "@/types";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";

export async function saveCalendarEvent(event: CalendarEvent) {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  try {
    // Insert the calendar event into the "calendar_events" table
    const { data, error } = await supabase
      .from("calendar_events")
      .insert(event)
      .select();

    if (error) {
      throw new Error(`Error saving calendar event: ${error.message}`);
    }

    console.log("Calendar event saved successfully!");
    return data;
  } catch (error) {
    console.error("Error saving calendar event:", error);
  }
}
