import { Profile } from "@/types";
import { fetchSession } from "@/utils/FetchSession";
import { supabase } from "@/utils/Supabase";

export async function handleUnfollow(
  followerId: string,
  followingId: string
): Promise<void> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) {
    console.error("Error fetching follows:", error);
    throw new Error("Failed to unfollow");
  }
}

export async function handleFollow(
  followerId: string,
  followingId: string
): Promise<void> {
  const session = await fetchSession();
  if (!session) {
    throw new Error("No active session");
  }
  const { data, error } = await supabase
    .from("follows")
    .upsert({ following_id: followingId, follower_id: followerId })
    .single();
  if (error) {
    console.error("Error fetching follows:", error);
    throw new Error("Failed to follow");
  }
}
