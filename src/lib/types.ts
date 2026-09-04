export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  isFree: boolean;
  contextLength: number;
  badge: string;
  category: 'general' | 'coding' | 'reasoning' | 'creative';
  avatarColor: string;
}

export interface ModelResponse {
  modelId: string;
  modelName: string;
  provider: string;
  content: string;
  latencyMs: number;
  tokensUsed?: number;
  error?: string;
}

export interface ScoreCriterion {
  name: string;
  score: number; // 0 to 10
  comment: string;
}

export interface ModelEvaluation {
  modelId: string;
  modelName: string;
  overallScore: number; // 0 to 10
  rank: number;
  criteria: {
    accuracy: ScoreCriterion;
    completeness: ScoreCriterion;
    clarity: ScoreCriterion;
    reasoning: ScoreCriterion;
  };
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export interface ComparisonResult {
  id: string;
  timestamp: string;
  prompt: string;
  responses: ModelResponse[];
  evaluations: ModelEvaluation[];
  winnerModelId: string;
  winnerRationale: string;
  evaluatorModel: string;
  isDemo: boolean;
}

export interface CompareApiRequest {
  prompt: string;
  modelIds: string[];
  evaluatorModelId?: string;
  userApiKey?: string;
  isDemo?: boolean;
}
