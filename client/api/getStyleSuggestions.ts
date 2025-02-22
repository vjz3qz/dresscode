import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";
import axios from "axios";
import { axiosParamSerializer } from "@/utils/AxiosParamSerializer";

type SelectedItem = {
  id: number;
  reason: string;
};

// Function to fetch outfits from the Supabase table
export async function getStyleSuggestions(occasion?: string): Promise<{
  selected_items: SelectedItem[];
  notes: string;
}> {
  try {
    const session = await fetchSession();
    if (!session) {
      throw new Error("No active session");
    }

    // hit wrapped

    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await axios.get(`${BACKEND_URL}/style-for-occasion`, {
      params: {
        occasion: occasion,
      },
      paramsSerializer: axiosParamSerializer,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Error getting style: ${response.statusText}`);
    }

    const result = response.data["result"];

    return result as {
      selected_items: SelectedItem[];
      notes: string;
    };
  } catch (error) {
    console.error("Error getting style:", error);
    return { selected_items: [], notes: "" }; // Provide default values in case of error
  }
}
