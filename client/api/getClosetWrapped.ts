import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";
import axios from "axios";
import { axiosParamSerializer } from "@/utils/AxiosParamSerializer";

// Function to fetch outfits from the Supabase table
export async function getClosetWrapped(): Promise<string> {
  try {
    const session = await fetchSession();
    if (!session) {
      throw new Error("No active session");
    }
    const { data, error } = await supabase.from("outfits").select("id");
    const outfitIds = data?.map((object) => object.id);

    if (error) {
      console.error("Error fetching outfits:", error);
      return ""; // Return an empty string on error
    }

    // hit wrapped

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await axios.get(`${BACKEND_URL}/closet-wrapped`, {
      params: {
        outfit_ids: outfitIds, // Pass array of filenames as query params
      },
      paramsSerializer: axiosParamSerializer,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Error getting wrapped: ${response.statusText}`);
    }

    const result = response.data["result"];
    return result;
  } catch (error) {
    console.error("Error getting closet wrapped:", error);
    return "";
  }
}
