import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if credentials are valid (i.e. not empty and not placeholders)
const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "https://your-supabase-project.supabase.co" &&
  supabaseUrl.trim() !== "" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your-supabase-anon-key-placeholder" &&
  supabaseAnonKey.trim() !== "";

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    "Stitch Prism Retail OS: Supabase is NOT configured. Running in offline/localStorage fallback mode. " +
    "Update your .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable cloud database sync."
  );
}
