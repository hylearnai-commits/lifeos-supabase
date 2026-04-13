"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvConfig, getSupabaseEnvMessage } from "./env";

export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnvConfig();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(getSupabaseEnvMessage());
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
