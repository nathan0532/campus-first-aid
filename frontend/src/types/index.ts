export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  createdAt: string;
}

export interface TrainingRecord {
  id: string;
  userId: string;
  scenarioType: 'cpr' | 'heimlich';
  score: number;
  duration: number;
  completedAt: string;
  steps: StepResult[];
}

export interface StepResult {
  stepId: string;
  stepName: string;
  completed: boolean;
  timeSpent: number;
  attempts: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  type: 'cpr' | 'heimlich';
  steps: ScenarioStep[];
}

export interface ScenarioStep {
  id: string;
  name: string;
  description: string;
  instruction: string;
  expectedAction: string;
  timeLimit?: number;
}