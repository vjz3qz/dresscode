import { Profile } from "@/types";
import { supabase } from "@/utils/Supabase";
import { fetchSession } from "@/utils/FetchSession";

export async function createProfile(profile: Profile) {
  try {
    const session = await fetchSession();
    if (!session) {
      throw new Error("No active session");
    }

    // get the id from session
    if (!profile.id) {
      profile.id = session.user.id;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select();

    if (error) {
      throw new Error(`Error saving profile: ${error.message}`);
    }

    console.log("Profile saved successfully!");
    return data;
  } catch (error) {
    console.error("Error saving profile:", error);
  }
}
