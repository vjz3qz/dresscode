import { Profile } from "@/types";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";

export async function handleUnfollow(
  follower_id: string,
  following_id: string
): Promise<void> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
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
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("follows")
    .upsert({ following_id, follower_id })
    .single();
  if (error) {
    console.error("Error fetching follows:", error);
    throw new Error("Failed to follow");
  }
}
