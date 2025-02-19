import { Item } from "@/types";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";

// Function to fetch items from the Supabase table
export async function fetchItems(userId: string): Promise<Item[]> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId ? userId : session.user.id);

  if (error) {
    console.error("Error fetching items:", error);
    return []; // Return an empty array on error
  }

  return data as Item[];
}

export async function fetchItemById(ItemId: string): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", ItemId);

  if (error) {
    console.error("Error fetching look by ID:", error);
    return {} as Item;
  }

  return data[0] as Item;
}
