import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL ?? ""; // Provide a default value if supabaseUrl is undefined
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? ""; // Provide a default value if supabaseKey is undefined

console.log("supabaseUrl:", supabaseUrl);
console.log("supabaseKey:", supabaseKey);
if (!supabaseUrl) {
  throw new Error("Missing env.EXPO_PUBLIC_SUPABASE_PROJECT_URL");
}
if (!supabaseKey) {
  throw new Error("Missing env.EXPO_PUBLIC_SUPABASE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
