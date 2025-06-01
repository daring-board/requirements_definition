import { Task, StepData } from "@/types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export const createTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTask = async (taskId: string, taskData: Partial<Task>) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...taskData,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return data;
};

export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw error;
};
