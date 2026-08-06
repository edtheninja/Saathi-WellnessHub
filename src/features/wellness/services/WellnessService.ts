import type { WellnessState } from "../types/wellness";

class WellnessService {
  async getWellness(): Promise<WellnessState> {
    return {
      physical: {},
      mental: {},
      device: {
        connected: false,
      },
      score: undefined,
    };
  }
}

export default new WellnessService();