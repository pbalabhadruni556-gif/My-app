// This file only runs on the SERVER (never sent to the browser).
// It uses the secret service-role key, which is why your database
// stays safe even though the app is public.
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
