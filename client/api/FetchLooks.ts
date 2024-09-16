import { Look, Outfit } from "@/types";
import { supabase } from "@/utils/Supabase";
import { addImageUrls } from "@/api/FetchImageUrl";

// Function to fetch looks from the Supabase table
export async function fetchLooks(): Promise<Look[]> {
  const { data, error } = await supabase.from("looks").select("*");

  if (error) {
    console.error("Error fetching looks:", error);
    return []; // Return an empty array on error
  }

  return data as Look[];
}

export async function fetchLookById(LookId: string): Promise<Look> {
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
