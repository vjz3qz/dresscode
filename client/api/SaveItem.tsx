import { Item } from "@/types";
import { supabase } from "@/utils/Supabase";
import { uploadImageUri } from "@/api/UploadImage";

export async function saveItem(item: Item, screenshotUri: string) {
  try {
    const s3Key = await uploadImageUri(screenshotUri);

    // Add the S3 key to the outfit metadata and save the outfit to Supabase
    item.s3_key = s3Key;
    const { error } = await supabase.from("items").insert([item]);

    if (error) {
      throw new Error(`Error saving item: ${error.message}`);
    }

    console.log("Item and screenshot saved successfully!");
  } catch (error) {
    console.error("Error saving item:", error);
  }
}
