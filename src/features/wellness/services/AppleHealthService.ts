class AppleHealthService {
  async connect() {
    console.log("Checking Apple Health...");
  }

  async requestPermissions() {
    console.log("Requesting HealthKit permissions...");
  }

  async sync() {
    console.log("Syncing Apple Health...");
  }
}

export default new AppleHealthService();