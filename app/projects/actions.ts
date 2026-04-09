"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function addProject(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || "work";

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

  await supabase.from("projects").insert({
    user_id: user.id,
    name,
    category,
    status: "active",
  });

  revalidatePath("/projects");
}

export async function toggleProjectStatus(formData: FormData) {
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
    .from("projects")
    .update({
      status: status === "active" ? "archived" : "active",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/projects");
}
