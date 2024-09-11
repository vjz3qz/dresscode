import { TableTypes } from "@/types";
import { supabase } from "@/utils/Supabase";
import axios from "axios";

export async function fetchImageUrl(imageName: string) {
  if (!imageName) {
    return;
  }

  try {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await axios.get(
      `${BACKEND_URL}/get-image-url/${imageName}`
    );

    return response.data["result"]["url"];
  } catch (error) {
    // throw new Error(`Error fetching image URL: ${error}`);
    // console.error("Error fetching image URL:", error);
    return "";
  }
}

export async function fetchAllImageUrls<T extends keyof TableTypes>(
  tableName: T
) {
  let { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    // throw new Error(`Error fetching items: ${error.message}`);
    // console.error("Error fetching items:", error.message);
    return [];
  }
  if (!data || data.length === 0) {
    // throw new Error("No data found");
    // console.error("No data found");
    return [];
  }

  let objects: TableTypes[T][] = [];
  for (let i = 0; i < data.length; i++) {
    if (!data[i]["s3_key"]) {
      continue;
    }
    const imageUrl = await fetchImageUrl(data[i]["s3_key"]);
    data[i]["image_url"] = imageUrl;
    objects.push(data[i] as TableTypes[T]); // Type assertion here
  }

  return objects;
}
