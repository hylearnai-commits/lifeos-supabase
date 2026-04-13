import { redirect } from "next/navigation";
import { createClient } from "./server";
import { getSupabaseEnvMessage, hasSupabaseEnv } from "./env";

function withMessage(pathname: string, message: string) {
  const separator = pathname.includes("?") ? "&" : "?";
  return `${pathname}${separator}message=${encodeURIComponent(message)}`;
}

export async function createActionClient(redirectPath: string) {
  if (!hasSupabaseEnv()) {
    redirect(withMessage(redirectPath, getSupabaseEnvMessage()));
  }
  return createClient();
}
