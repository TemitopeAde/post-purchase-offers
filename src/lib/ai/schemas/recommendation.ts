import { z } from 'zod';

export const AIRecommendationItemSchema = z.object({
  productId: z.string().min(1),
  relevance: z.enum(['high', 'medium', 'low']).default('medium'),
  relationship: z.string().default('related_product'),
  reason: z.string().min(1).max(200),
});

export const AIRecommendationResponseSchema = z.object({
  recommendations: z.array(AIRecommendationItemSchema).default([]),
});

export type AIRecommendationItem = z.infer<typeof AIRecommendationItemSchema>;
export type AIRecommendationResponse = z.infer<typeof AIRecommendationResponseSchema>;
