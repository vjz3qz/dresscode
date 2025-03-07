import { supabase } from "@/utils/Supabase";

export async function fetchSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession(); // hangs if either env variables are null or supabase does not populate
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error fetching session:", error);
  }
}
