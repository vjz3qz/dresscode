import { Look, Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";
import { addImageUrls } from "@/api/FetchImageUrl";
import { Session } from "@supabase/supabase-js";
import { fetchSession } from "@/utils/FetchSession";

// Function to fetch looks from the Supabase table
export async function fetchLooks(userId?: string): Promise<Look[]> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("looks")
    .select("*")
    .eq("user_id", userId ? userId : session.user.id);

  if (error) {
    console.error("Error fetching looks:", error);
    return []; // Return an empty array on error
  }

  return data as Look[];
}

export async function fetchLookById(LookId: string): Promise<Look> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("looks")
    .select("*")
    .eq("id", LookId);

  if (error) {
    console.error("Error fetching look by ID:", error);
    return {} as Look;
  }

  return data[0] as Look;
}

// Function to fetch outfits by look ID
export async function fetchOutfitsByLook(LookId: string): Promise<Outfit[]> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("looks_outfits")
    .select("outfit_id")
    .eq("look_id", LookId);

  if (error) {
    console.error("Error fetching outfits by look:", error);
    return [];
  }

  const outfitIds = data.map((row) => row.outfit_id);

  const { data: outfits, error: outfitsError } = await supabase
    .from("outfits")
    .select("*")
    .in("id", outfitIds);

  if (outfitsError) {
    console.error("Error fetching outfits by look:", outfitsError);
    return [];
  }

  return outfits as Outfit[];
}

export async function loadLooksWithOutfits(
  fetchedLooks: Look[]
): Promise<Look[]> {
  try {
    for (const look of fetchedLooks) {
      const outfits = await fetchOutfitsByLook((look.id || "").toString());
      const outfitsWithImages = await addImageUrls(outfits);
      look.outfits = outfitsWithImages;
    }

    return fetchedLooks;
  } catch (error: any) {
    console.error("Error fetching looks:", error.message);
    return [];
  }
}
