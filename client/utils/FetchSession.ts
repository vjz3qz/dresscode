import { supabase } from "@/utils/Supabase";

export async function fetchSession() {
  try {
    console.log("try");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession(); // TODO hangs if either env variables are null or supabase does not populate
    console.log("finish");
    if (error) throw error;
    return session;
  } catch (error) {
    console.error("Error fetching session:", error);
  }
}
