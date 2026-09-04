import { ModelConfig } from './types';

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    provider: 'Google',
    description: 'Ultra-fast multimodal model with strong reasoning, instruction following, and broad knowledge.',
    isFree: true,
    contextLength: 1048576,
    badge: '⚡ Ultra Fast',
    category: 'general',
    avatarColor: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    provider: 'Meta',
    description: 'High capability open-weight powerhouse with industry-leading open benchmark performance.',
    isFree: true,
    contextLength: 131072,
    badge: '🏆 Best All-Rounder',
    category: 'general',
    avatarColor: 'from-indigo-600 to-blue-500',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    description: 'State-of-the-art open reasoning model using deep reinforcement learning chain-of-thought.',
    isFree: true,
    contextLength: 65536,
    badge: '🧠 Deep Reasoning',
    category: 'reasoning',
    avatarColor: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B (Free)',
    provider: 'Alibaba',
    description: 'Specialized programming model with exceptional code generation, debugging, and syntax mastery.',
    isFree: true,
    contextLength: 32768,
    badge: '💻 Coding Expert',
    category: 'coding',
    avatarColor: 'from-violet-600 to-purple-400',
  },
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'DeepSeek V3 (Free)',
    provider: 'DeepSeek',
    description: 'Powerful MoE model delivering fast responses across multilingual and technical queries.',
    isFree: true,
    contextLength: 65536,
    badge: '🚀 Versatile',
    category: 'general',
    avatarColor: 'from-sky-500 to-indigo-500',
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B (Free)',
    provider: 'Mistral AI',
    description: 'Compact, rapid inference engine great for quick summaries and direct Q&A.',
    isFree: true,
    contextLength: 32768,
    badge: '⚡ Lightweight',
    category: 'general',
    avatarColor: 'from-amber-500 to-orange-400',
  },
  // Optional flagship models (Clearly marked paid if selected)
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Benchmark leader in nuance, writing, and coding (Requires OpenRouter credits).',
    isFree: false,
    contextLength: 200000,
    badge: '👑 Flagship',
    category: 'reasoning',
    avatarColor: 'from-amber-600 to-orange-500',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Omni-model offering high intelligence and multimodal capability (Requires OpenRouter credits).',
    isFree: false,
    contextLength: 128000,
    badge: '⭐ Premium',
    category: 'general',
    avatarColor: 'from-emerald-600 to-green-500',
  },
];

export const DEFAULT_FREE_MODELS: string[] = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
];

export const DEFAULT_EVALUATOR_MODEL = 'google/gemini-2.0-flash-exp:free';

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
