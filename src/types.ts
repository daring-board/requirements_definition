export interface StepData {
  step1: string[];
  step2: {
    targetUsers: string;
    usageScenarios: string;
    benefits: string;
  };
  step3: {
    usageScenes: string;
    explanation: string;
  };
  step4: {
    feedback: string;
    improvements: string;
    finalCheck: string;
  };
}

export interface Task {
  id: string;
  stepData: StepData;
  completedSteps: number[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}
