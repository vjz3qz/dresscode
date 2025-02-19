import { CalendarEvent } from "@/types";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";

// Function to fetch calendarEvents from the Supabase table
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase.from("calendarEvents").select("*");

  if (error) {
    console.error("Error fetching calendarEvents:", error);
    return []; // Return an empty array on error
  }

  return data as CalendarEvent[];
}

export async function fetchCalendarEventById(
  calendarEventId: string
): Promise<CalendarEvent> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("id", calendarEventId);

  if (error) {
    console.error("Error fetching look by ID:", error);
    return {} as CalendarEvent;
  }

  return data[0] as CalendarEvent;
}
