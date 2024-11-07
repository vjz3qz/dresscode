import { Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";

// Function to fetch outfits from the Supabase table
export async function fetchOutfits(): Promise<Outfit[]> {
  const { data, error } = await supabase.from("outfits").select("*");

  if (error) {
    console.error("Error fetching outfits:", error);
    return []; // Return an empty array on error
  }

  return data as Outfit[];
}

export async function fetchOutfitById(OutfitId: string): Promise<Outfit> {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", OutfitId);

  if (error) {
    console.error("Error fetching look by ID:", error);
    return {} as Outfit;
  }

  return data[0] as Outfit;
}
