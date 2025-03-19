import { Look, Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";
import { fetchSession } from "@/utils/FetchSession";

export async function saveLook(look: Look, outfits: Outfit[]): Promise<Look> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  try {
    const { data, error } = await supabase.from("looks").insert(look).select();

    if (error) {
      throw new Error(`Error saving look: ${error.message}`);
    }
    if (!data || data.length === 0) {
      throw new Error("Insert succeeded but no look was returned.");
    }

    console.log("Look saved successfully!");
    try {
      await addOutfitsToLook(data[0].id, outfits);
    } catch (error) {
      console.error("Error saving look outfits:", error);
      throw error;
    }
    return data[0];
  } catch (error) {
    console.error("Error saving look:", error);
    throw error;
  }
}

async function addOutfitsToLook(lookId: string, outfits: Outfit[]) {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  try {
    const lookOutfits = outfits.map((outfit) => ({
      look_id: lookId,
      outfit_id: outfit.id,
    }));

    const { error } = await supabase.from("looks_outfits").insert(lookOutfits);

    if (error) {
      throw new Error(`Error saving look outfits: ${error.message}`);
    }

    console.log("Look outfits saved successfully!");
  } catch (error) {
    console.error("Error saving look outfits:", error);
    throw error;
  }
}
