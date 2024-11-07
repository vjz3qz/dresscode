import { Item } from "@/types";
import { supabase } from "@/utils/Supabase";

// Function to fetch items from the Supabase table
export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase.from("items").select("*");

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
