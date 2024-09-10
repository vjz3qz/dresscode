import { Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";

export async function saveOutfit(outfit: Outfit) {
  const { error } = await supabase.from("outfits").insert([outfit]);

  if (error) {
    throw new Error(`Error saving outfit: ${error.message}`);
  }
}
