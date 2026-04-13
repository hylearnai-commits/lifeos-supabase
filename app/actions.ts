"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createActionClient } from "@/lib/supabase/action-client";

export async function signOut() {
  const supabase = await createActionClient("/login");
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addTask(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const priority = formData.get("priority")?.toString().trim() || "medium";
  const projectIdStr = formData.get("projectId")?.toString().trim();
  
  // 处理 NextUI 传过来的特殊值 "none" 或空值
  const projectId = !projectIdStr || projectIdStr === "none" ? null : projectIdStr;

  if (!title) {
    return;
  }

  const supabase = await createActionClient("/");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    title,
    status: "todo",
    priority,
    project_id: projectId,
  });

  if (
    error &&
    (error.message.includes("priority") || error.message.includes("project_id"))
  ) {
    const retry = await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      status: "todo",
    });
    error = retry.error;
  }

  if (error) {
    redirect(`/?message=${encodeURIComponent(`任务保存失败：${error.message}`)}`);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  redirect(`/?message=${encodeURIComponent("任务已保存")}`);
}

export async function toggleTask(formData: FormData) {
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString();

  if (!id || !status) {
    return;
  }

  const supabase = await createActionClient("/");
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
  revalidatePath("/projects");
}

export async function deleteTask(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    return;
  }

  const supabase = await createActionClient("/");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath("/projects");
}
