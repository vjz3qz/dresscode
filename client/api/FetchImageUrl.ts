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

export async function fetchImageUrls(imageNames: string[]) {
  if (!imageNames || imageNames.length === 0) {
    return {};
  }

  try {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await axios.get(`${BACKEND_URL}/get-image-urls`, {
      params: {
        filenames: imageNames, // Pass array of filenames as query params
      },
    });

    return response.data; // This is expected to be an object with { filename: url }
  } catch (error) {
    // console.error("Error fetching image URLs:", error);
    return {};
  }
}

export async function fetchAllImageUrls<T extends keyof TableTypes>(
  tableName: T
) {
  let { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    // console.error("Error fetching items:", error.message);
    return [];
  }
  if (!data || data.length === 0) {
    // console.error("No data found");
    return [];
  }

  let objects: TableTypes[T][] = await addImageUrls(data as any); // Wait for the URLs to be added
  return objects;
}

export async function addImageUrls(data: any[]) {
  const imageNames = data.map((item) => item["s3_key"]).filter(Boolean);
  const imageUrls = await fetchImageUrls(imageNames);

  let objects: any[] = [];
  for (let i = 0; i < data.length; i++) {
    const s3Key = data[i]["s3_key"];
    if (!s3Key) {
      continue;
    }
    data[i]["image_url"] = imageUrls[s3Key] || ""; // Add the URL if it exists
    objects.push(data[i]);
  }

  return objects;
}
