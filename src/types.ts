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

// デフォルトのステップデータ
export const defaultStepData: StepData = {
  step1: [""],
  step2: {
    targetUsers: "",
    usageScenarios: "",
    benefits: "",
  },
  step3: {
    usageScenes: "",
    explanation: "",
  },
  step4: {
    feedback: "",
    improvements: "",
    finalCheck: "",
  },
}

export interface Task {
  id: string;
  title: string;
  description: string;
  stepData: StepData;
  completedSteps: number[];
  progress: number;
  created_at: Date;
  updated_at: Date;
}
