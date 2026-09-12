export interface PhysicalHealth {
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  calories?: number;
  bloodOxygen?: number;
  hydration?: number;
  stress?: number;
}

export interface MentalHealth {
  mood?: number;
  journalEntries?: number;
  meditationMinutes?: number;
  meditationStreak?: number;
}

export interface DeviceInfo {
  connected: boolean;
  name?: string;
  provider?: string;
  lastSync?: Date;
}

export interface WellnessState {
  physical: PhysicalHealth;
  mental: MentalHealth;
  device: DeviceInfo;
  score?: number;
}