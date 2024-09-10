import { Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";

export async function saveOutfit(outfit: Outfit, screenshotUri: string) {
  // save screen shot to s3, then add s3 key to outfit
  // const { data, error } = await supabase.storage
  //   .from("outfits")
  //   .upload(`outfits/${outfit.name}.png`, screenshotUri);
  const { error } = await supabase.from("outfits").insert([outfit]);

  if (error) {
    throw new Error(`Error saving outfit: ${error.message}`);
  }
}
