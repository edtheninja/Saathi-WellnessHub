class HealthConnectService {
  async connect() {
    console.log("Checking Health Connect...");
  }

  async requestPermissions() {
    console.log("Requesting permissions...");
  }

  async sync() {
    console.log("Syncing data...");
  }
}

export default new HealthConnectService();