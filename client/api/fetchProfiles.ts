import { Profile } from "@/types";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";
export async function fetchSuggestedProfiles(): Promise<Profile[]> {
  try {
    const session = await fetchSession();
    if (!session) {
      throw new Error("No active session");
    }
    // later update to do semantic search
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", session.user.id);

    if (error) {
      console.error("Error fetching look by ID:", error);
      return [] as Profile[];
    }

    return data as Profile[];
  } catch (error) {
    console.error("Error fetching suggested profiles:", error);
    return [] as Profile[];
  }
}

export async function fetchProfileById(profileId: string): Promise<Profile> {
  try {
    const session = await fetchSession();
    if (!session) {
      throw new Error("No active session");
    }
    // later update to do semantic search
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId);

    if (error) {
      console.error("Error fetching look by ID:", error);
      return {} as Profile;
    }

    return data[0] as Profile;
  } catch (error) {
    console.error("Error fetching suggested profiles:", error);
    return {} as Profile;
  }
}
