"use server";

import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/action-client";

function getAuthErrorMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit")) {
    return "请求过于频繁，请稍后再试或更换邮箱";
  }

  if (lower.includes("invalid email")) {
    return "邮箱格式无效，请检查后重试";
  }

  if (lower.includes("invalid login credentials")) {
    return "邮箱或密码错误；如果是首次注册，请先点“注册新账号”并完成邮箱验证";
  }

  if (lower.includes("email not confirmed")) {
    return "邮箱尚未验证，请先到邮箱点击验证链接";
  }

  if (lower.includes("user already registered")) {
    return "该邮箱已注册，请直接登录或使用已验证邮箱";
  }

  return message;
}

function getEmailAndPassword(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email) {
    redirect(`/login?message=${encodeURIComponent("请输入邮箱")}`);
  }

  if (!password) {
    redirect(`/login?message=${encodeURIComponent("请输入密码")}`);
  }

  if (email === "you@example.com") {
    redirect(`/login?message=${encodeURIComponent("请填写你自己的真实邮箱地址")}`);
  }

  if (password.length < 6) {
    redirect(`/login?message=${encodeURIComponent("密码至少 6 位")}`);
  }

  return { email, password };
}

export async function signInWithPassword(formData: FormData) {
  const { email, password } = getEmailAndPassword(formData);
  const supabase = await createActionClient("/login");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(getAuthErrorMessage(error.message))}`);
  }

  redirect("/");
}

export async function signUpWithPassword(formData: FormData) {
  const { email, password } = getEmailAndPassword(formData);
  const supabase = await createActionClient("/login");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(getAuthErrorMessage(error.message))}`);
  }

  if (data.session) {
    redirect("/");
  }

  redirect(`/login?message=${encodeURIComponent("注册成功，请前往邮箱完成验证后登录")}`);
}

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    redirect(`/login?message=${encodeURIComponent("请输入邮箱")}`);
  }

  if (email === "you@example.com") {
    redirect(`/login?message=${encodeURIComponent("请填写你自己的真实邮箱地址")}`);
  }

  const supabase = await createActionClient("/login");
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

export async function signInWithGoogle() {
  const supabase = await createActionClient("/login");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?message=${encodeURIComponent("Google 登录暂时不可用，请稍后重试")}`);
  }

  redirect(data.url);
}
