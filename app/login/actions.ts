"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getAuthErrorMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit")) {
    return "请求过于频繁，请稍后再试或更换邮箱";
  }

  if (lower.includes("invalid email")) {
    return "邮箱格式无效，请检查后重试";
  }

  return message;
}

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    redirect(`/login?message=${encodeURIComponent("请输入邮箱")}`);
  }

  if (email === "you@example.com") {
    redirect(`/login?message=${encodeURIComponent("请填写你自己的真实邮箱地址")}`);
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(getAuthErrorMessage(error.message))}`);
  }

  redirect(`/login?message=${encodeURIComponent("登录链接已发送，请检查邮箱")}`);
}
