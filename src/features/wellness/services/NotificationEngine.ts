import NotificationStore from "./NotificationStore";
import type { Recommendation } from "../types/Recommendation";

class NotificationEngine {

  generate(recommendations: Recommendation[]) {

    recommendations.forEach(rec => {

      NotificationStore.add({

        id: crypto.randomUUID(),

        title: rec.title,

        description: rec.description,

        type: rec.category,

        createdAt: new Date().toISOString(),

        read: false,

      });

    });

  }

}

export default new NotificationEngine();