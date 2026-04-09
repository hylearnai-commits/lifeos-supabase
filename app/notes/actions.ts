"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addNote(formData: FormData) {
  const title = formData.get("title")?.toString().trim() || "";
  const content = formData.get("content")?.toString().trim() || "";
  const type = formData.get("type")?.toString().trim() || "note";

  if (!title && !content) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("notes").insert({
    user_id: user.id,
    title,
    content,
    type,
  });

  revalidatePath("/notes");
}
