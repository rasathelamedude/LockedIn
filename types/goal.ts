export interface Goal {
  id: number;
  title: string;
  description?: string | null;
  deadline: string;
  efficiency: number;
  timeLogged: number;
  gradientColors: string[];
  createdAt: string;
  updatedAt: string | null;
}
