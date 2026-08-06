import { supabase } from "@/supabaseClient";

class GoalService {

  async getSummary() {

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