import { Profile } from "@/types";
import { supabase } from "@/utils/Supabase";

export async function handleUnfollow(
  follower_id: string,
  following_id: string
): Promise<void> {
  const { data, error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", follower_id)
    .eq("following_id", following_id);
  if (error) {
    console.error("Error fetching follows:", error);
    throw new Error("Failed to unfollow");
  }
}

export async function handleFollow(
  follower_id: string,
  following_id: string
): Promise<void> {
  const { data, error } = await supabase
    .from("follows")
    .upsert({ following_id, follower_id })
    .single();
  if (error) {
    console.error("Error fetching follows:", error);
    throw new Error("Failed to follow");
  }
}
