
export type ThemeType = 'MINT' | 'LAVENDER' | 'APRICOT';

export interface HealthData {
  heartRate: number;
  bloodPressure: string;
  bloodOxygen: number;
  stress: number;
  focusScore: number;
}

export interface Recommendation {
  id: string;
  text: string;
  icon: string;
}

export interface WeeklyDataPoint {
  day: string;
  stress: number;
  focus: number;
}

export interface ThemeColors {
  primary: string;
}
