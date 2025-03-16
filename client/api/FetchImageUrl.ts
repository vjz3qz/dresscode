import { TableTypes } from "@/types";
import { axiosParamSerializer } from "@/utils/AxiosParamSerializer";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";
import { Session } from "@supabase/supabase-js";
import axios from "axios";

export async function fetchImageUrl(key: string) {
  if (!key) {
    return;
  }

  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }

  try {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await axios.get(`${BACKEND_URL}/get-image-url/${key}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

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

  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }

  try {
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await axios.get(`${BACKEND_URL}/get-image-urls`, {
      params: {
        filenames: imageNames, // Pass array of filenames as query params
      },
      paramsSerializer: axiosParamSerializer,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    return response.data["result"]; // This is expected to be an object with { filename: url }
  } catch (error) {
    // console.error("Error fetching image URLs:", error);
    return {};
  }
}

export async function fetchAllImageUrls<T extends keyof TableTypes>(
  tableName: T,
  userId?: string
) {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }

  let { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("user_id", userId ? userId : session.user.id);
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

export async function addImageUrls(
  data: any[],
  getUnprocessed: boolean = false
) {
  const imageNames = data
    .map((item) => item[getUnprocessed ? "unprocessed_image_key" : "image_key"])
    .filter(Boolean);
  const imageUrls = await fetchImageUrls(imageNames);

  let objects: any[] = [];
  for (let i = 0; i < data.length; i++) {
    const imageKey = data[i]["image_key"];
    if (!imageKey) {
      continue;
    }
    data[i][getUnprocessed ? "unprocessed_image_url" : "image_url"] =
      imageUrls[imageKey] || ""; // Add the URL if it exists
    objects.push(data[i]);
  }

  return objects;
}
