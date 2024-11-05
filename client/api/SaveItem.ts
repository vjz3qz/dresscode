import { Item } from "@/types";
import { supabase } from "@/utils/Supabase";
import { uploadImageUri } from "@/api/UploadImage";
import { fetchSession } from "@/utils/FetchSession";

export async function saveItem(item: Item, screenshotUri: string) {
  try {
    const session = await fetchSession();
    if (!session) {
      throw new Error("No active session");
    }
    const s3Key = await uploadImageUri(screenshotUri, session);

    // Add the S3 key to the outfit metadata and save the outfit to Supabase
    item.s3_key = s3Key;
    const { data, error } = await supabase.from("items").insert(item).select();

    if (error) {
      throw new Error(`Error saving item: ${error.message}`);
    }

    console.log("Item and screenshot saved successfully!");
    return data;
  } catch (error) {
    console.error("Error saving item:", error);
  }
}
