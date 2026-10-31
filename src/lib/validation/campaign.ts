import { z } from 'zod';

export const campaignFormSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required').max(100, 'Campaign name must be 100 characters or fewer'),
  discount: z.coerce.number().finite('Discount must be a number').min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  minSubtotal: z.coerce.number().finite('Minimum order subtotal must be a number').min(0, 'Minimum order subtotal cannot be negative'),
  priority: z.coerce.number().int('Priority must be a whole number').min(1, 'Priority must be at least 1').max(1000, 'Priority cannot exceed 1000'),
  mode: z.enum(['AI', 'HYBRID', 'RULES', 'MANUAL']),
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
