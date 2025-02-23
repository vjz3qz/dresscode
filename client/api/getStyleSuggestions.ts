import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";
import axios from "axios";
import { axiosParamSerializer } from "@/utils/AxiosParamSerializer";
import { SuggestedOutfit } from "@/types";

// Function to fetch outfits from the Supabase table
export async function getStyleSuggestions(): Promise<SuggestedOutfit[]> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("suggested_outfits")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("status", "ready");

  if (error) {
    console.error("Error fetching outfits:", error);
    return []; // Return an empty array on error
  }

  return data as SuggestedOutfit[];
}

// Function to fetch outfits from the Supabase table
export async function queueStyleSuggestion(occasion: string): Promise<void> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }

  const suggestedOutfitForQueue: SuggestedOutfit = {
    user_id: session.user.id,
    occasion: occasion,
    status: "queued",
  };
  const { data, error } = await supabase
    .from("suggested_outfits")
    .insert(suggestedOutfitForQueue)
    .select();

  if (error) {
    throw new Error(
      `Error creating suggested outfit for queue: ${error.message}`
    );
  }
  try {
    // queue job
    const { id } = (data as SuggestedOutfit[])[0];
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await axios.get(`${BACKEND_URL}/suggest-outfit`, {
      params: {
        suggested_outfit_id: id,
      },
      paramsSerializer: axiosParamSerializer,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(
        `Error queue suggested outfit job: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error queue suggested outfit job:", error);
  }
}
