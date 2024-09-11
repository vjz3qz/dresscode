import { Look } from "@/types";
import { supabase } from "@/utils/Supabase";
import { uploadImageUri } from "@/api/UploadImage";

export async function saveLook(look: Look) {
  try {
    // const s3Key = await uploadImageUri(screenshotUri);

    // // Add the S3 key to the look metadata and save the look to Supabase
    // look.s3_key = s3Key;
    const { data, error } = await supabase.from("looks").insert(look).select();

    if (error) {
      throw new Error(`Error saving look: ${error.message}`);
    }

    console.log("Look and screenshot saved successfully!");
    return data;
  } catch (error) {
    console.error("Error saving look:", error);
  }
}
