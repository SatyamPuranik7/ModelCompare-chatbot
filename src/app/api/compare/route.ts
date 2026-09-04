import { NextRequest, NextResponse } from 'next/server';
import { CompareApiRequest, ComparisonResult, ModelResponse } from '@/lib/types';
import { queryMultipleModels } from '@/lib/openrouter';
import { evaluateResponsesWithLLM, runDeterministicEvaluation } from '@/lib/evaluator';
import { DEFAULT_EVALUATOR_MODEL, getModelById } from '@/lib/models';
import { MOCK_COMPARISONS } from '@/lib/mockData';

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

        let content = '';
        let latency = 900 + Math.floor(Math.random() * 1200);

        if (mId.includes('gemini')) {
          latency = 750 + Math.floor(Math.random() * 400);
          content = `### Summary\nHere is a direct and efficient overview addressing: **"${prompt.slice(0, 80)}"**.\n\n` +
            `1. **Core Concept:** Direct solution emphasizing practical real-world execution.\n` +
            `2. **Key Consideration:** Scalability, low latency, and clear boundaries.\n` +
            `3. **Implementation Step:** Apply modular components with minimal boilerplate.\n\n` +
            `\`\`\`text\n[Input] ──► [Analysis Engine] ──► [Optimized Solution]\n\`\`\`\n` +
            `*Tip: Gemini prioritizes high speed and structured clarity.*`;
        } else if (mId.includes('llama')) {
          latency = 1200 + Math.floor(Math.random() * 600);
          content = `### Detailed Analysis\nRegarding the inquiry: *${prompt}*.\n\n` +
            `#### Fundamental Principles:\n` +
            `- **Theoretical Foundation:** Grounded in open standard protocols and industry best practices.\n` +
            `- **Systemic Architecture:** Ensuring resilient fault tolerance and rigorous validation.\n` +
            `- **Edge Cases:** Accounting for network timeouts, boundary errors, and invalid parameters.\n\n` +
            `In summary, this approach provides dependable, open, and reproducible results.`;
        } else if (mId.includes('r1')) {
          latency = 1800 + Math.floor(Math.random() * 800);
          content = `<think>\nAnalyzing the prompt intent: "${prompt}"\nEvaluating optimal strategies, logical correctness, and verifying absence of edge case contradictions...\n</think>\n\n` +
            `### Reasoning & Solution\n\n` +
            `To solve this comprehensively, we break down the problem into first principles:\n\n` +
            `1. **Initial Assessment:** Deconstructing the core constraints.\n` +
            `2. **Deep Logic:** Each step builds logically upon previous conclusions.\n` +
            `3. **Synthesized Conclusion:** Validated against edge cases with strict mathematical/logical consistency.`;
        } else if (mId.includes('qwen') || mId.includes('coder')) {
          latency = 1100 + Math.floor(Math.random() * 500);
          content = `### Technical Implementation\nHere is the clean, robust solution for: \`${prompt.slice(0, 60)}\`:\n\n` +
            `\`\`\`typescript\n// Production-ready implementation\nexport function solveTask<T>(input: T): { success: boolean; data: T } {\n  // Validation & execution\n  console.log("Processing input:", input);\n  return { success: true, data: input };\n}\n\`\`\`\n\n` +
            `- **Time Complexity:** O(1) optimal lookup\n- **Type Safety:** Strict generics included\n- **Error Handling:** Guarded against undefined inputs.`;
        } else {
          content = `### Response\nAddressing: "${prompt}".\n\nHere is a structured explanation covering the most critical aspects, with clear actionable recommendations and balanced tradeoffs.`;
        }

        return {
          modelId: mId,
          modelName: name,
          provider,
          content,
          latencyMs: latency,
          tokensUsed: 350 + Math.floor(Math.random() * 250),
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
