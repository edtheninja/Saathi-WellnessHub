import { supabase } from "@/supabaseClient";
import { getDemoGoal, isDemoMode } from "./DemoMode";
export interface Goal {
  id?: string;
  completed?: boolean;
  [key: string]: unknown; // covers other columns from select("*") we don't use yet
}

class GoalService {

  async getSummary() {
    if (isDemoMode()) return getDemoGoal();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return {};

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .single();

    return data ?? {};
  }
}

export default new GoalService();