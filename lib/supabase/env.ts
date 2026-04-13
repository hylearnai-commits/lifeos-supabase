export type SupabaseEnvConfig = {
  supabaseUrl: string | undefined;
  supabasePublishableKey: string | undefined;
};

export function getSupabaseEnvConfig(): SupabaseEnvConfig {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabasePublishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function hasSupabaseEnv() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnvConfig();
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseEnvMessage() {
  return "请先配置环境变量 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY（或 NEXT_PUBLIC_SUPABASE_ANON_KEY）";
}
