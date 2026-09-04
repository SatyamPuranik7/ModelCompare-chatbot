import { ModelResponse } from './types';
import { getModelById } from './models';

interface OpenRouterCompletionChoice {
  message?: {
    content?: string;
  };
  finish_reason?: string;
}

interface OpenRouterCompletionResponse {
  id?: string;
  choices?: OpenRouterCompletionChoice[];
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  error?: {
    message?: string;
    code?: number;
  };
}

export async function querySingleModel(
  modelId: string,
  prompt: string,
  apiKey: string,
  timeoutMs: number = 30000
): Promise<ModelResponse> {
  const modelConfig = getModelById(modelId);
  const modelName = modelConfig?.name || modelId;
  const provider = modelConfig?.provider || 'AI Provider';

  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://modelcompare.local',
        'X-Title': 'ModelCompare AI',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errorText = await res.text();
      let errorMsg = `HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(errorText);
        errorMsg = parsed?.error?.message || errorMsg;
      } catch {
        // use raw text if not json
      }
      return {
        modelId,
        modelName,
        provider,
        content: '',
        latencyMs,
        error: errorMsg,
      };
    }

    const data: OpenRouterCompletionResponse = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      modelId,
      modelName,
      provider,
      content,
      latencyMs,
      tokensUsed,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMsg = err instanceof Error ? err.message : 'Request failed';
    return {
      modelId,
      modelName,
      provider,
      content: '',
      latencyMs,
      error: errorMsg.includes('aborted') ? 'Request timed out after 30s' : errorMsg,
    };
  }
}

export async function queryMultipleModels(
  modelIds: string[],
  prompt: string,
  apiKey: string
): Promise<ModelResponse[]> {
  const promises = modelIds.map((id) => querySingleModel(id, prompt, apiKey));
  const settled = await Promise.allSettled(promises);

  return settled.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const modelId = modelIds[idx];
    const modelConfig = getModelById(modelId);
    return {
      modelId,
      modelName: modelConfig?.name || modelId,
      provider: modelConfig?.provider || 'AI Provider',
      content: '',
      latencyMs: 0,
      error: result.reason?.message || 'Failed to query model',
    };
  });
}
