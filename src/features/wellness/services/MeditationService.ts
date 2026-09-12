import { supabase } from "@/supabaseClient";
import { getDemoMeditation, isDemoMode } from "./DemoMode";

class MeditationService {

  async getSummary() {
    if (isDemoMode()) return getDemoMeditation();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return {
        completed: 0,
        minutes: 0,
      };

    const { data } = await supabase
      .from("meditation")
      .select("duration, completed")
      .eq("user_id", user.id)
      .eq("completed", true);

    return {

      completed: data?.length ?? 0,

      minutes:
        data?.reduce(
          (sum, session) => sum + session.duration,
          0
        ) ?? 0,
    };
  }
}

export default new MeditationService();