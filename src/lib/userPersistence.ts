import { supabase } from "@/supabaseClient";

export async function readUserSetting<T>(key: string, fallback: T): Promise<T> {
  try {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .limit(1)
      .single();
    return data?.value === undefined ? fallback : (data.value as T);
  } catch {
    return fallback;
  }
}

export async function writeUserSetting<T>(key: string, value: T): Promise<void> {
  try {
    const existing = await supabase
      .from("settings")
      .select("id")
      .eq("key", key)
      .limit(1)
      .single();

    if (existing.data?.id) {
      await supabase.from("settings").update({ value }).eq("id", existing.data.id);
    } else {
      await supabase.from("settings").insert({ key, value });
    }
  } catch (error) {
    console.error(`Unable to persist setting ${key}:`, error);
  }
}

export async function appendUserActivity<T extends Record<string, unknown>>(
  activity: T,
): Promise<void> {
  try {
    await supabase.from("activity_history").insert(activity);
  } catch (error) {
    console.error("Unable to persist activity:", error);
  }
}
