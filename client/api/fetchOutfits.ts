import { Outfit } from "@/types";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";

// Function to fetch outfits from the Supabase table
export async function fetchOutfits(userId?: string): Promise<Outfit[]> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", userId ? userId : session.user.id);

  if (error) {
    console.error("Error fetching outfits:", error);
    return []; // Return an empty array on error
  }

  return data as Outfit[];
}

export async function fetchOutfitById(outfitId: number): Promise<Outfit> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", outfitId);

  if (error) {
    console.error("Error fetching outfit by ID:", error);
    return {} as Outfit;
  }

  return data[0] as Outfit;
}
