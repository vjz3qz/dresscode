import { Item } from "@/types";
import { supabase } from "@/utils/Supabase";
import { uploadImageUri } from "@/api/UploadImage";
import { fetchSession } from "@/utils/FetchSession";
import { removeBackground } from "@/api/RemoveBackground";

export async function saveItem(
  item: Item,
  screenshotUri: string
): Promise<Item> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  try {
    const unprocessedImageKey = await uploadImageUri(screenshotUri);

    // Add the S3 key to the outfit metadata and save the outfit to Supabase
    item.unprocessed_image_key = unprocessedImageKey;

    // Remove the background
    const imageKey = await removeBackground(unprocessedImageKey);

    item.image_key = imageKey;

    const { data, error } = await supabase.from("items").insert(item).select();

    if (error) {
      throw new Error(`Error saving item: ${error.message}`);
    }
    if (!data || data.length === 0) {
      throw new Error("Insert succeeded but no item was returned.");
    }

    console.log("Item and screenshot saved successfully!");
    return data[0];
  } catch (error) {
    console.error("Error saving item:", error);
    throw error;
  }
}
