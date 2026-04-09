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

  const { error } = await supabase.from("projects").insert({
    user_id: user.id,
    name,
    category,
    status: "active",
  });

  if (error) {
    redirect(`/projects?message=${encodeURIComponent(`新增项目失败：${error.message}`)}`);
  }

  revalidatePath("/projects");
  revalidatePath("/");
  redirect(`/projects?message=${encodeURIComponent("项目已创建")}`);
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

  const { error } = await supabase
    .from("projects")
    .update({
      status: status === "active" ? "archived" : "active",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/projects?message=${encodeURIComponent(`更新项目失败：${error.message}`)}`);
  }

  revalidatePath("/projects");
  revalidatePath("/");
  redirect(`/projects?message=${encodeURIComponent("项目状态已更新")}`);
}

export async function deleteProject(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    redirect(`/projects?message=${encodeURIComponent(`删除项目失败：${error.message}`)}`);
  }

  revalidatePath("/projects");
  revalidatePath("/");
  redirect(`/projects?message=${encodeURIComponent("项目已删除")}`);
}
