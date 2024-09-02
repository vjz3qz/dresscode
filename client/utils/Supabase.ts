import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_URL ?? ""; // Provide a default value if supabaseUrl is undefined
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? ""; // Provide a default value if supabaseKey is undefined
export const supabase = createClient(supabaseUrl, supabaseKey);
