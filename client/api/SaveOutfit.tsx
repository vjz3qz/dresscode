import { Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";
import { uploadImageUri } from "@/api/UploadImage";

export async function saveOutfit(outfit: Outfit, screenshotUri: string) {
  try {
    const s3Key = await uploadImageUri(screenshotUri);

    // Add the S3 key to the outfit metadata and save the outfit to Supabase
    outfit.s3_key = s3Key;
    const { data, error } = await supabase
      .from("outfits")
      .insert(outfit)
      .select();

    if (error) {
      throw new Error(`Error saving outfit: ${error.message}`);
    }

    console.log("Outfit and screenshot saved successfully!");
    return data;
  } catch (error) {
    console.error("Error saving outfit:", error);
  }
}
