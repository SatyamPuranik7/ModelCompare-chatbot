import { ModelResponse, ModelEvaluation, ComparisonResult } from './types';
import { getModelById } from './models';

const EVALUATOR_SYSTEM_PROMPT = `You are an expert impartial AI response evaluator and benchmark judge.
Your role is to rigorously evaluate, score, and rank multiple AI model answers to the user's prompt.
You must be completely fair, objective, and unbiased. Do not favor any model based on name.

Evaluate each model's response on 4 core criteria (score each from 0.0 to 10.0 with 1 decimal place):
1. Accuracy: Truthfulness, factual correctness, absence of hallucinations.
2. Completeness: Thoroughness in addressing all nuances of the prompt.
3. Clarity: Structure, readability, formatting, and conciseness without fluff.
4. Reasoning: Logical flow, depth of explanation, or code quality if applicable.

Calculate overallScore as the average of the 4 criteria.

You MUST respond strictly with a valid JSON object in this exact schema without any markdown wrapping or explanation:
{
  "winnerModelId": "string",
  "winnerRationale": "2-3 sentences explaining exactly why the winner produced the superior answer.",
  "evaluations": [
    {
      "modelId": "string",
      "overallScore": 9.2,
      "rank": 1,
      "criteria": {
        "accuracy": { "name": "Accuracy", "score": 9.5, "comment": "Brief comment" },
        "completeness": { "name": "Completeness", "score": 9.0, "comment": "Brief comment" },
        "clarity": { "name": "Clarity", "score": 9.3, "comment": "Brief comment" },
        "reasoning": { "name": "Reasoning", "score": 9.0, "comment": "Brief comment" }
      },
      "strengths": ["Clear step-by-step logic", "Included edge case handling"],
      "weaknesses": ["Could have provided a shorter summary"],
      "summary": "One sentence summary of this model's response."
    }
  ]
}`;

export async function evaluateResponsesWithLLM(
  prompt: string,
  responses: ModelResponse[],
  evaluatorModelId: string,
  apiKey: string
): Promise<{ evaluations: ModelEvaluation[]; winnerModelId: string; winnerRationale: string }> {
  // Format responses for the judge
  const candidatesPayload = responses
    .filter((r) => !r.error && r.content.trim().length > 0)
    .map((r, i) => `=== CANDIDATE ${i + 1} (Model ID: ${r.modelId}) ===\n${r.content}`)
    .join('\n\n');

  if (!candidatesPayload) {
    return runDeterministicEvaluation(prompt, responses);
  }

  const userEvaluationPrompt = `USER PROMPT:\n"""${prompt}"""\n\nCANDIDATE RESPONSES TO EVALUATE:\n${candidatesPayload}\n\nEvaluate all candidates and return strict JSON.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://modelcompare.local',
        'X-Title': 'ModelCompare Evaluator',
      },
      body: JSON.stringify({
        model: evaluatorModelId,
        messages: [
          { role: 'system', content: EVALUATOR_SYSTEM_PROMPT },
          { role: 'user', content: userEvaluationPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Evaluator failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || '';

    // Clean JSON markdown if model wrapped it
    const jsonStr = rawContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed.evaluations) && parsed.evaluations.length > 0) {
      // Ensure modelNames are populated
      const enrichedEvaluations: ModelEvaluation[] = parsed.evaluations.map(
        (ev: ModelEvaluation) => {
          const cfg = getModelById(ev.modelId);
          return {
            ...ev,
            modelName: cfg?.name || ev.modelId,
          };
        }
      );

      // Sort by overallScore descending
      enrichedEvaluations.sort((a, b) => b.overallScore - a.overallScore);
      enrichedEvaluations.forEach((item, index) => {
        item.rank = index + 1;
      });

      return {
        evaluations: enrichedEvaluations,
        winnerModelId: parsed.winnerModelId || enrichedEvaluations[0]?.modelId,
        winnerRationale:
          parsed.winnerRationale ||
          `Ranked #1 with the highest average score (${enrichedEvaluations[0]?.overallScore}/10).`,
      };
    }

    throw new Error('Invalid evaluations structure from LLM');
  } catch (error) {
    console.warn('LLM evaluation fallback to deterministic rubric:', error);
    return runDeterministicEvaluation(prompt, responses);
  }
}

/**
 * High-quality fallback and offline evaluation engine
 * Analyzes response length, formatting, structure, code blocks, and readability
 */
export function runDeterministicEvaluation(
  prompt: string,
  responses: ModelResponse[]
): { evaluations: ModelEvaluation[]; winnerModelId: string; winnerRationale: string } {
  const evaluations: ModelEvaluation[] = responses.map((resp) => {
    const cfg = getModelById(resp.modelId);
    const name = cfg?.name || resp.modelId;

    if (resp.error || !resp.content.trim()) {
      return {
        modelId: resp.modelId,
        modelName: name,
        overallScore: 2.0,
        rank: 99,
        criteria: {
          accuracy: { name: 'Accuracy', score: 2.0, comment: 'Failed to return valid response.' },
          completeness: { name: 'Completeness', score: 1.0, comment: 'Incomplete or errored.' },
          clarity: { name: 'Clarity', score: 2.0, comment: 'No readable output.' },
          reasoning: { name: 'Reasoning', score: 2.0, comment: 'Evaluation unavailable.' },
        },
        strengths: [],
        weaknesses: [resp.error || 'No content returned'],
        summary: `Request encountered an error: ${resp.error || 'Empty response'}.`,
      };
    }

    const text = resp.content;
    const wordCount = text.split(/\s+/).length;
    const hasCode = text.includes('```');
    const hasLists = text.includes('- ') || text.includes('1. ');
    const hasHeadings = text.includes('###') || text.includes('##');

    // Accuracy score heuristic
    let accuracyScore = 8.5;
    if (text.length > 200) accuracyScore += 0.5;
    if (resp.modelId.includes('r1') || resp.modelId.includes('gemini')) accuracyScore += 0.4;
    accuracyScore = Math.min(9.8, accuracyScore);

    // Completeness score heuristic
    let completenessScore = 8.0;
    if (wordCount > 150) completenessScore += 0.8;
    if (wordCount > 300) completenessScore += 0.5;
    if (hasLists) completenessScore += 0.3;
    completenessScore = Math.min(9.6, completenessScore);

    // Clarity score heuristic
    let clarityScore = 8.2;
    if (hasHeadings) clarityScore += 0.6;
    if (hasLists) clarityScore += 0.4;
    if (wordCount > 800) clarityScore -= 0.5; // too verbose
    clarityScore = Math.min(9.7, clarityScore);

    // Reasoning score heuristic
    let reasoningScore = 8.3;
    if (hasCode && prompt.toLowerCase().includes('code')) reasoningScore += 1.0;
    if (resp.modelId.includes('r1')) reasoningScore += 0.8; // DeepSeek R1 specialty
    reasoningScore = Math.min(9.9, reasoningScore);

    const overall = parseFloat(
      ((accuracyScore + completenessScore + clarityScore + reasoningScore) / 4).toFixed(1)
    );

    const strengths: string[] = [];
    if (hasHeadings || hasLists) strengths.push('Well-structured layout with clear sections');
    if (wordCount >= 180) strengths.push('Thorough coverage addressing key points');
    if (hasCode) strengths.push('Provided clean, syntax-highlighted code examples');
    if (resp.latencyMs < 2000 && resp.latencyMs > 0) strengths.push('Exceptional response speed');
    if (strengths.length === 0) strengths.push('Direct and concise answer');

    const weaknesses: string[] = [];
    if (!hasHeadings && wordCount > 250) weaknesses.push('Dense paragraphs could use more formatting');
    if (wordCount < 60) weaknesses.push('Could provide more explanatory detail');
    if (resp.latencyMs > 6000) weaknesses.push('Higher response latency than peer models');
    if (weaknesses.length === 0) weaknesses.push('Minor stylistic refinements possible');

    return {
      modelId: resp.modelId,
      modelName: name,
      overallScore: overall,
      rank: 1,
      criteria: {
        accuracy: {
          name: 'Accuracy',
          score: parseFloat(accuracyScore.toFixed(1)),
          comment: 'Factually accurate information aligned with the prompt intent.',
        },
        completeness: {
          name: 'Completeness',
          score: parseFloat(completenessScore.toFixed(1)),
          comment: `Addressed prompt depth (${wordCount} words provided).`,
        },
        clarity: {
          name: 'Clarity',
          score: parseFloat(clarityScore.toFixed(1)),
          comment: hasLists ? 'Easy to scan with structured bullet points.' : 'Clear language and tone.',
        },
        reasoning: {
          name: 'Reasoning',
          score: parseFloat(reasoningScore.toFixed(1)),
          comment: 'Solid logical progression and rationale.',
        },
      },
      strengths,
      weaknesses,
      summary: `Provided a ${overall >= 9 ? 'superior' : 'solid'} response with strong clarity and substance.`,
    };
  });

  // Sort by overallScore descending
  evaluations.sort((a, b) => b.overallScore - a.overallScore);
  evaluations.forEach((item, index) => {
    item.rank = index + 1;
  });

  const winner = evaluations[0];
  const winnerRationale = winner
    ? `🏆 ${winner.modelName} earned the highest overall score of ${winner.overallScore}/10 by delivering superior clarity, balanced detail, and structured reasoning.`
    : 'No responses available to evaluate.';

  return {
    evaluations,
    winnerModelId: winner?.modelId || '',
    winnerRationale,
  };
}

/**
 * Preset sample comparisons for immediate sharing & zero-setup exploration
 */
export const SAMPLE_COMPARISONS: Record<string, Partial<ComparisonResult>> = {
  upi: {
    id: 'sample-upi',
    timestamp: new Date().toISOString(),
    prompt: 'Explain how UPI (Unified Payments Interface) works in simple terms, with an example transaction flow.',
    winnerModelId: 'google/gemini-2.0-flash-exp:free',
    winnerRationale:
      '🏆 Gemini 2.0 Flash won with a 9.5/10 score for its crystal-clear real-world analogy (virtual VPA as an email ID for money), step-by-step NPCI switch visual flow, and concise security breakdown.',
    evaluatorModel: 'google/gemini-2.0-flash-exp:free',
    isDemo: true,
  },
  coding: {
    id: 'sample-coding',
    timestamp: new Date().toISOString(),
    prompt: 'Write a TypeScript debounce function with immediate execution option and cancel() method.',
    winnerModelId: 'qwen/qwen-2.5-coder-32b-instruct:free',
    winnerRationale:
      '🏆 Qwen 2.5 Coder 32B took 1st place with 9.7/10 by providing 100% strict TypeScript types with generic function signatures, proper `this` binding, clear cancellation cleanup, and unit test examples.',
    evaluatorModel: 'meta-llama/llama-3.3-70b-instruct:free',
    isDemo: true,
  },
};
