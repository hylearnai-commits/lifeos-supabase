"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/action-client";

export async function addNote(formData: FormData) {
  const title = formData.get("title")?.toString().trim() || "";
  const content = formData.get("content")?.toString().trim() || "";
  const type = formData.get("type")?.toString().trim() || "note";

  if (!title && !content) {
    return;
  }

  const supabase = await createActionClient("/notes");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    title,
    content,
    type,
  });

  if (error) {
    redirect(`/notes?message=${encodeURIComponent(`保存记录失败：${error.message}`)}`);
  }

  revalidatePath("/notes");
  redirect(`/notes?message=${encodeURIComponent("记录已保存")}`);
}

export async function deleteNote(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    return;
  }

  const supabase = await createActionClient("/notes");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("notes").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/notes?message=${encodeURIComponent(`删除记录失败：${error.message}`)}`);
  }

  revalidatePath("/notes");
  revalidatePath("/");
  redirect(`/notes?message=${encodeURIComponent("记录已删除")}`);
}
