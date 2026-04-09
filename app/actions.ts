"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title")?.toString().trim();

  if (!title) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    status: "todo",
  });

  revalidatePath("/");
}

export async function toggleTask(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("tasks")
    .update({
      status: status === "done" ? "todo" : "done",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/");
}
