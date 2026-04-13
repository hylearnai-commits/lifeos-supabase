"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/action-client";

function mapHabitErrorMessage(raw: string) {
  if (raw.includes("Could not find the table 'public.habits'")) {
    return "缺少 habits 表，请在 Supabase SQL Editor 执行 supabase/migrations/202604090003_repair_habits.sql";
  }
  if (raw.includes("Could not find the table 'public.habit_logs'")) {
    return "缺少 habit_logs 表，请在 Supabase SQL Editor 执行 supabase/migrations/202604090003_repair_habits.sql";
  }
  return raw;
}

export async function addHabit(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const frequency = formData.get("frequency")?.toString().trim() || "daily";
  const targetValue = Number(formData.get("targetValue")?.toString() || "1");

  if (!name) {
    return;
  }

  const supabase = await createActionClient("/habits");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name,
    frequency,
    target_value: targetValue > 0 ? targetValue : 1,
  });

  if (error) {
    redirect(`/habits?message=${encodeURIComponent(`新增习惯失败：${mapHabitErrorMessage(error.message)}`)}`);
  }

  revalidatePath("/habits");
  redirect(`/habits?message=${encodeURIComponent("习惯已创建")}`);
}

export async function checkInHabit(formData: FormData) {
  const habitId = formData.get("habitId")?.toString();

  if (!habitId) {
    return;
  }

  const supabase = await createActionClient("/habits");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      habit_id: habitId,
      log_date: today,
      value: 1,
      completed: true,
    },
    { onConflict: "habit_id,log_date" },
  );

  if (error) {
    redirect(`/habits?message=${encodeURIComponent(`打卡失败：${mapHabitErrorMessage(error.message)}`)}`);
  }

  revalidatePath("/habits");
  redirect(`/habits?message=${encodeURIComponent("打卡成功")}`);
}

export async function deleteHabit(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    return;
  }

  const supabase = await createActionClient("/habits");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("habits").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/habits?message=${encodeURIComponent(`删除习惯失败：${mapHabitErrorMessage(error.message)}`)}`);
  }

  revalidatePath("/habits");
  revalidatePath("/");
  redirect(`/habits?message=${encodeURIComponent("习惯已删除")}`);
}
