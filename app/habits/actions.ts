"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addHabit(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const frequency = formData.get("frequency")?.toString().trim() || "daily";
  const targetValue = Number(formData.get("targetValue")?.toString() || "1");

  if (!name) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("habits").insert({
    user_id: user.id,
    name,
    frequency,
    target_value: targetValue > 0 ? targetValue : 1,
  });

  revalidatePath("/habits");
}

export async function checkInHabit(formData: FormData) {
  const habitId = formData.get("habitId")?.toString();

  if (!habitId) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  await supabase.from("habit_logs").upsert(
    {
      user_id: user.id,
      habit_id: habitId,
      log_date: today,
      value: 1,
      completed: true,
    },
    { onConflict: "habit_id,log_date" },
  );

  revalidatePath("/habits");
}
