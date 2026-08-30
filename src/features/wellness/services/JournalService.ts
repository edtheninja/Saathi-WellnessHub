import { supabase } from "@/supabaseClient";

export interface JournalEntry {
  id: string;
  mood: number;
  label: string;
  createdAt: string;
}

class JournalService {
  async getSummary() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return { totalEntries: 0 };

    const { data } = await supabase
      .from("journals")
      .select("id")
      .eq("user_id", user.id);

    return {
      totalEntries: data?.length ?? 0,
    };
  }

  async getEntries(): Promise<JournalEntry[]> {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
      .from("journals")
      .select("id, mood, label, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return (data ?? []).map(row => ({
      id: row.id,
      mood: row.mood,
      label: row.label,
      createdAt: row.created_at,
    }));
  }
}

export default new JournalService();