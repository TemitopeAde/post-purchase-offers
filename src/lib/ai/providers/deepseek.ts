import type { RecommendationInput, RecommendationResult } from '../../types';
import { AIRecommendationResponseSchema } from '../schemas/recommendation';

export interface RecommendationProvider {
  name: string;
  recommend(input: RecommendationInput): Promise<RecommendationResult>;
}

export class DeepSeekProvider implements RecommendationProvider {
  public readonly name = 'deepseek';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.baseUrl = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async recommend(input: RecommendationInput): Promise<RecommendationResult> {
    if (!this.isConfigured()) {
      throw new Error('DEEPSEEK_API_KEY is not configured on the server');
    }

    if (input.candidates.length === 0) {
      return {
        recommendations: [],
        provider: this.name,
        model: this.model,
      };
    }

    const systemPrompt = `You are an expert e-commerce recommendation system for Wix Stores.
Your task is to analyze what the customer just purchased and rank the best complementary, accessory, or upgrade products from the provided CANDIDATE LIST.

CRITICAL RULES:
1. ONLY select product IDs that appear in the candidate list. NEVER invent or hallucinate product IDs.
2. Select at most ${input.maxRecommendations} items.
3. Provide a concise, customer-facing reason (1 sentence, max 150 chars) explaining why each recommended item complements the purchase.
4. Output MUST be valid JSON strictly matching this schema:
{
  "recommendations": [
    {
      "productId": "string matching a candidate product_id",
      "relevance": "high" | "medium" | "low",
      "relationship": "complementary" | "accessory" | "upgrade" | "frequently_bought_together",
      "reason": "Short reason explaining why this complements the purchase"
    }
  ]
}`;

    const userPrompt = JSON.stringify({
      currency: input.currency,
      purchased_products: input.purchasedProducts.map((p) => ({
        product_id: p.productId,
        name: p.name,
        description: p.description?.slice(0, 100),
        category: p.category,
      })),
      candidate_products: input.candidates.map((c) => ({
        product_id: c.productId,
        name: c.name,
        description: c.description?.slice(0, 100),
        category: c.category,
        price: c.price,
      })),
      max_recommendations: input.maxRecommendations,
    });

    const maxRetries = 2;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout to keep storefront fast

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 600,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error ${response.status}: ${errorText.slice(0, 200)}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('DeepSeek API returned empty response content');
        }

        const parsedJson = JSON.parse(content);
        const validated = AIRecommendationResponseSchema.parse(parsedJson);

        // Filter out any hallucinated IDs that were not in candidates
        const validCandidateIds = new Set(input.candidates.map((c) => c.productId));
        const filtered = validated.recommendations.filter((r) => validCandidateIds.has(r.productId));

        return {
          recommendations: filtered.slice(0, input.maxRecommendations),
          provider: this.name,
          model: this.model,
          tokensUsed: data?.usage?.total_tokens,
        };
      } catch (err: any) {
        lastError = err;
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 300 * Math.pow(2, attempt - 1)));
        }
      }
    }

    throw lastError || new Error('DeepSeek recommendation failed');
  }
}

export const defaultDeepSeekProvider = new DeepSeekProvider();
