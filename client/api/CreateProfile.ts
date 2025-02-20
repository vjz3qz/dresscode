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

export async function handleUpdateProfile({
  username,
  display_name,
  avatar_url,
  gender,
  age,
  brands,
  preferences,
}: {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  gender?: string;
  age?: number;
  brands?: string[];
  preferences?: string[];
}) {
  if (!username && !avatar_url && !display_name) return;
  const session = await fetchSession();

  if (!session?.user) throw new Error("No user on the session!");

  const updates = {
    id: session?.user.id,
    username,
    display_name,
    avatar_url,
    gender,
    age,
    brands,
    preferences,
    updated_at: new Date(),
  };

  const { error } = await supabase.from("profiles").upsert(updates);

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}
