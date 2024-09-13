import { Look, Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";

// Function to fetch looks from the Supabase table
export async function fetchLooks(): Promise<Look[]> {
  const { data, error } = await supabase.from("looks").select("*");

  if (error) {
    console.error("Error fetching looks:", error);
    return []; // Return an empty array on error
  }

  return data as Look[];
}

export async function fetchOutfitsByLook(LookId: string): Promise<Outfit[]> {
  const { data, error } = await supabase
    .from("looks_outfits")
    .select("outfit_id")
    .eq("look_id", LookId);

  if (error) {
    console.error("Error fetching outfits by look:", error);
    return [];
  }

  const outfitIds = data.map((row) => row.outfit_id);

  const { data: outfits, error: outfitsError } = await supabase
    .from("outfits")
    .select("*")
    .in("id", outfitIds);

  if (outfitsError) {
    console.error("Error fetching outfits by look:", outfitsError);
    return [];
  }

  return outfits as Outfit[];
}
