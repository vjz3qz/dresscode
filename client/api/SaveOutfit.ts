import { Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";
import { uploadImageUri } from "@/api/UploadImage";
import { fetchSession } from "@/utils/FetchSession";

export async function saveOutfit(
  outfit: Outfit,
  screenshotUri: string
): Promise<Outfit> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  try {
    const imageKey = await uploadImageUri(screenshotUri);

    // Add the S3 key to the outfit metadata and save the outfit to Supabase
    outfit.image_key = imageKey;
    const { data, error } = await supabase
      .from("outfits")
      .insert(outfit)
      .select();

    if (error) {
      throw new Error(`Error saving outfit: ${error.message}`);
    }
    if (!data || data.length === 0) {
      throw new Error("Insert succeeded but no outfit was returned.");
    }

    console.log("Outfit and screenshot saved successfully!");
    return data[0];
  } catch (error) {
    console.error("Error saving outfit:", error);
    throw error;
  }
}
