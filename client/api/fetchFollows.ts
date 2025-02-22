import { Profile } from "@/types";
import { supabase } from "@/utils/Supabase";

export async function fetchFollowingProfiles(
  userId: string
): Promise<Profile[]> {
  let followingList = [];
  try {
    followingList = await fetchFollowingList(userId);
  } catch (error) {
    console.error("Error fetching follows:", error);
    return []; // Return an empty array on error
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", followingList);
  if (error) {
    console.error("Error fetching follows:", error);
    return []; // Return an empty array on error
  }

  return data as Profile[];
}

export async function fetchFollowerProfiles(
  userId: string
): Promise<Profile[]> {
  let followerList = [];
  try {
    followerList = await fetchFollowerList(userId);
  } catch (error) {
    console.error("Error fetching follows:", error);
    return []; // Return an empty array on error
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", followerList);
  if (error) {
    console.error("Error fetching follows:", error);
    return []; // Return an empty array on error
  }

  return data as Profile[];
}

async function fetchFollowingList(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", userId);
  console.log("data", data);
  if (error) {
    console.log("Error fetching follow list:", error);
    return []; // Return an empty array on error
  }
  return data.map((follow) => follow.following_id);
}

async function fetchFollowerList(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("following_id", userId);
  if (error) {
    console.log("Error fetching follow list:", error);
    return []; // Return an empty array on error
  }
  return data.map((follow) => follow.follower_id);
}
