import { NextRequest, NextResponse } from 'next/server';
import { CompareApiRequest, ComparisonResult, ModelResponse } from '@/lib/types';
import { queryMultipleModels } from '@/lib/openrouter';
import { evaluateResponsesWithLLM, runDeterministicEvaluation } from '@/lib/evaluator';
import { DEFAULT_EVALUATOR_MODEL, getModelById } from '@/lib/models';
import { MOCK_COMPARISONS } from '@/lib/mockData';

function generateSimulatedAnswer(modelId: string, prompt: string): string {
  const p = prompt.toLowerCase();
  const isCoding =
    p.includes('code') ||
    p.includes('function') ||
    p.includes('python') ||
    p.includes('typescript') ||
    p.includes('javascript') ||
    p.includes('sql') ||
    p.includes('debounce') ||
    p.includes('algorithm');

  const isComparison =
    p.includes('difference') ||
    p.includes('vs') ||
    p.includes('compare') ||
    p.includes('between');

  // 1. GEMINI: Fast, clear, visual, real-world analogies
  if (modelId.includes('gemini')) {
    if (isCoding) {
      return `### Overview & Strategy\nTo solve this cleanly, we want a solution that is simple to understand, memory-efficient, and easy to test.\n\n` +
        `\`\`\`typescript\n// Clean, modern implementation\nexport function solution(input: any): any {\n  if (!input) throw new Error("Input required");\n  // Processing logic\n  return { processed: true, timestamp: Date.now() };\n}\n\`\`\`\n\n` +
        `### Key Highlights\n` +
        `- **Time Complexity:** O(n) linear execution.\n` +
        `- **Edge Cases Handled:** Null/undefined checks and input boundary validation.\n` +
        `- **Best Practice:** Keep functions pure and decoupled from global state.`;
    }

    if (isComparison) {
      return `### Quick Comparison\nHere is the core distinction regarding: **"${prompt}"**.\n\n` +
        `| Aspect | Option A | Option B |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Primary Focus** | High-level strategy & value | Execution & delivery |\n` +
        `| **Time Horizon** | Long-term (Years) | Short-to-medium term (Sprints/Months) |\n` +
        `| **Success Metric** | User adoption & ROI | On-time, on-budget completion |\n\n` +
        `### Intuitive Analogy\n` +
        `Think of **Option A** as deciding *where to build the bridge and why*, while **Option B** is managing *the construction cranes, budget, and daily work shifts*.\n\n` +
        `### Summary Recommendation\n` +
        `Both disciplines work in tandem: one sets the trajectory while the other ensures flawless operational execution.`;
    }

    return `### Direct Explanation: ${prompt}\n\n` +
      `Here is the clearest way to understand this:\n\n` +
      `1. **The Core Concept:** At its essence, this addresses how systems coordinate information reliably under constraints.\n` +
      `2. **How It Operates:**\n` +
      `   - **Step 1:** The initial state is defined with verified inputs.\n` +
      `   - **Step 2:** A transformation process applies deterministic rules.\n` +
      `   - **Step 3:** The output is emitted and validated against criteria.\n\n` +
      `\`\`\`text\n[Input Request] ──► [Processing Engine] ──► [Verified Result]\n\`\`\`\n\n` +
      `### Why This Matters\n` +
      `Mastering this concept allows you to build scalable, resilient systems that minimize errors and maximize efficiency.`;
  }

  // 2. LLAMA: Thorough, institutional, academic depth, architecture
  if (modelId.includes('llama')) {
    if (isCoding) {
      return `### Architectural Implementation\n\n` +
        `A robust implementation requires adherence to language specifications, strict typing, and separation of concerns.\n\n` +
        `\`\`\`typescript\n/**\n * Enterprise-grade implementation for: ${prompt.slice(0, 50)}\n */\nexport class TaskExecutor<T> {\n  private state: Map<string, T> = new Map();\n\n  public execute(key: string, value: T): boolean {\n    try {\n      this.state.set(key, value);\n      return true;\n    } catch (err) {\n      console.error("Execution failure:", err);\n      return false;\n    }\n  }\n}\n\`\`\`\n\n` +
        `#### Design Considerations:\n` +
        `1. **Memory Safety:** Uses scoped encapsulation to prevent state leakage.\n` +
        `2. **Extensibility:** Standard interfaces allow drop-in replacement.\n` +
        `3. **Fault Tolerance:** Try-catch guards against runtime exceptions.`;
    }

    return `### Comprehensive Breakdown\n\n` +
      `Regarding the topic: **"${prompt}"**\n\n` +
      `#### 1. Foundational Architecture\n` +
      `To properly evaluate this subject, one must examine the underlying systemic drivers. Historically, distributed systems relied on centralized coordination mechanisms, which introduced single points of failure.\n\n` +
      `#### 2. Key Functional Mechanisms\n` +
      `- **Protocol Compliance:** Enforces deterministic contracts across all communicating boundaries.\n` +
      `- **State Synchronization:** Maintains consistency across asynchronous nodes.\n` +
      `- **Validation Pipeline:** Pre-flight checks guarantee payload integrity prior to execution.\n\n` +
      `#### 3. Tradeoffs & Limitations\n` +
      `While this architecture provides high resilience and maintainability, it introduces marginal overhead in initial latency. In enterprise production environments, this tradeoff is universally preferred.`;
  }

  // 3. DEEPSEEK R1: Chain-of-thought, reasoning steps, first principles
  if (modelId.includes('r1')) {
    return `<think>\nAnalyzing prompt: "${prompt}"\nDeconstructing into fundamental premises:\n1. Identify what the user is really seeking (core truth vs peripheral details).\n2. Evaluate potential edge cases, ambiguities, and common pitfalls.\n3. Formulate a structured step-by-step derivation from first principles.\n4. Verify that conclusions are mathematically and logically sound.\n</think>\n\n` +
      `### First-Principles Analysis & Derivation\n\n` +
      `To answer this rigorously, we deconstruct the problem into foundational components:\n\n` +
      `#### Step 1: Defining Core Invariants\n` +
      `The question asks about **"${prompt}"**. We establish that any valid solution must satisfy three invariants:\n` +
      `1. Correctness under edge cases.\n` +
      `2. Predictability of outcome.\n` +
      `3. Minimal cognitive or computational complexity.\n\n` +
      `#### Step 2: Logical Progression\n` +
      `- If we start with the default assumption, we encounter friction when scaling.\n` +
      `- By decoupling state from the processing layer, we achieve linear composability.\n` +
      `- Therefore, the optimal path is a layered abstraction that isolates side-effects.\n\n` +
      `#### Step 3: Synthesis & Actionable Takeaway\n` +
      `In conclusion, the most effective mental model is to treat the system as a state machine where transitions are strictly validated before state commitment.`;
  }

  // 4. QWEN CODER: Programming specialist
  if (modelId.includes('qwen') || modelId.includes('coder')) {
    return `### Technical Solution\n\n` +
      `Here is a production-tested implementation addressing: \`${prompt.slice(0, 70)}\`\n\n` +
      `\`\`\`typescript\n// Strict TypeScript implementation with unit testing\nexport function solve<T extends Record<string, unknown>>(\n  payload: T\n): { success: boolean; data: T; latencyMs: number } {\n  const start = performance.now();\n  \n  if (!payload || typeof payload !== 'object') {\n    throw new TypeError('Invalid payload: expected object');\n  }\n\n  // Deterministic transformation\n  const result = Object.freeze({ ...payload });\n  const latencyMs = Math.round(performance.now() - start);\n\n  return {\n    success: true,\n    data: result,\n    latencyMs,\n  };\n}\n\`\`\`\n\n` +
      `#### Implementation Notes:\n` +
      `- **Complexity:** O(1) space overhead; O(n) key traversal.\n` +
      `- **Immutability:** \`Object.freeze\` guarantees zero unintended mutations.\n` +
      `- **Error Handling:** Explicit \`TypeError\` guarding against invalid types.`;
  }

  // Default Fallback
  return `### Detailed Response\n\n` +
    `Here is a complete, structured analysis for: **"${prompt}"**.\n\n` +
    `1. **Definition & Context:** Understanding the foundational concepts and scope.\n` +
    `2. **Practical Application:** How this operates in real-world scenarios.\n` +
    `3. **Key Takeaways:** Summarizing the most actionable insights and next steps.\n\n` +
    `This structure ensures both breadth and depth for the reader.`;
}

export async function POST(req: NextRequest) {
  try {
    const body: CompareApiRequest = await req.json();
    const { prompt, modelIds, evaluatorModelId, userApiKey, isDemo } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt cannot be empty.' }, { status: 400 });
    }

    if (!modelIds || modelIds.length < 2) {
      return NextResponse.json(
        { error: 'Please select at least 2 models to compare.' },
        { status: 400 }
      );
    }

    const effectiveApiKey = userApiKey?.trim() || process.env.OPENROUTER_API_KEY?.trim() || '';

    // If Demo mode requested or no API key present, provide simulated / mock results
    if (isDemo || !effectiveApiKey) {
      // Check if this matches our default mock prompt
      if (prompt.toLowerCase().includes('upi') || prompt.toLowerCase().includes('unified payments')) {
        return NextResponse.json({
          ...MOCK_COMPARISONS.default,
          timestamp: new Date().toISOString(),
        });
      }

      // Generate dynamic simulated response for any custom prompt
      const simulatedResponses: ModelResponse[] = modelIds.map((mId) => {
        const cfg = getModelById(mId);
        const name = cfg?.name || mId;
        const provider = cfg?.provider || 'AI Provider';

        let latency = 900 + Math.floor(Math.random() * 1000);
        if (mId.includes('gemini')) latency = 700 + Math.floor(Math.random() * 400);
        if (mId.includes('r1')) latency = 1600 + Math.floor(Math.random() * 600);

        const content = generateSimulatedAnswer(mId, prompt);

        return {
          modelId: mId,
          modelName: name,
          provider,
          content,
          latencyMs: latency,
          tokensUsed: 380 + Math.floor(Math.random() * 250),
        };
      });

      const { evaluations, winnerModelId, winnerRationale } = runDeterministicEvaluation(
        prompt,
        simulatedResponses
      );

      const result: ComparisonResult = {
        id: 'comp-' + Date.now().toString(36),
        timestamp: new Date().toISOString(),
        prompt,
        responses: simulatedResponses,
        evaluations,
        winnerModelId,
        winnerRationale,
        evaluatorModel: 'Evaluator Engine (Free Tier Demo)',
        isDemo: true,
      };

      return NextResponse.json(result);
    }

    // Real Live OpenRouter Execution (100% Free models or custom BYOK key)
    const responses = await queryMultipleModels(modelIds, prompt, effectiveApiKey);

    const evaluatorModel = evaluatorModelId || DEFAULT_EVALUATOR_MODEL;
    const { evaluations, winnerModelId, winnerRationale } = await evaluateResponsesWithLLM(
      prompt,
      responses,
      evaluatorModel,
      effectiveApiKey
    );

    const result: ComparisonResult = {
      id: 'comp-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      prompt,
      responses,
      evaluations,
      winnerModelId,
      winnerRationale,
      evaluatorModel,
      isDemo: false,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
