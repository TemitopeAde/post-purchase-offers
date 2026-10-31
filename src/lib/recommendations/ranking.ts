import type { Campaign, Offer, ProductCandidate, AIRecommendationItem } from '../types';

export function calculateOfferPrice(
  regularPrice: number,
  discountType: 'NONE' | 'PERCENTAGE' | 'FIXED',
  discountValue: number
): number {
  if (discountType === 'PERCENTAGE' && discountValue > 0) {
    const discounted = regularPrice * (1 - discountValue / 100);
    return Math.max(0.01, Math.round(discounted * 100) / 100);
  }
  if (discountType === 'FIXED' && discountValue > 0) {
    return Math.max(0.01, Math.round((regularPrice - discountValue) * 100) / 100);
  }
  return regularPrice;
}

export function rankCandidatesDeterministically(
  candidates: ProductCandidate[],
  options: {
    orderSubtotal: number;
    purchasedCategories?: string[];
    maxOffers: number;
    campaign: Campaign;
  }
): Offer[] {
  const { orderSubtotal, purchasedCategories = [], maxOffers, campaign } = options;

  // Filter in-stock only
  const available = candidates.filter((c) => c.inStock);

  // Score candidates
  const scored = available.map((candidate) => {
    let score = 50;

    // Category match
    if (candidate.category && purchasedCategories.includes(candidate.category)) {
      score += 30;
    }

    // Price sweet-spot: items priced 10% to 50% of order subtotal
    if (orderSubtotal > 0) {
      const ratio = candidate.price / orderSubtotal;
      if (ratio >= 0.1 && ratio <= 0.45) {
        score += 25;
      } else if (ratio < 0.1) {
        score += 15;
      } else if (ratio > 1.0) {
        score -= 20; // rarely converts when upsell is more expensive than entire order
      }
    }

    return { candidate, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const selected = scored.slice(0, maxOffers);

  return selected.map(({ candidate }) => {
    const offerPrice = calculateOfferPrice(
      candidate.price,
      campaign.discountType,
      campaign.discountValue
    );

    return {
      campaignId: campaign._id || '',
      productId: candidate.productId,
      variantId: candidate.variantId,
      productName: candidate.name,
      productImageUrl: candidate.imageUrl,
      regularPrice: candidate.price,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      offerPrice,
      title: candidate.name,
      description: candidate.description || 'Special post-purchase deal',
      badge: 'Frequently paired',
      priority: 1,
      active: true,
      reason: 'Popular add-on chosen for orders like yours.',
    };
  });
}

export function mergeAiRankingsWithOffers(
  aiRankings: AIRecommendationItem[],
  candidateMap: Map<string, ProductCandidate>,
  campaign: Campaign
): Offer[] {
  const offers: Offer[] = [];

  for (const rec of aiRankings) {
    const product = candidateMap.get(rec.productId);
    if (!product || !product.inStock) continue;

    const offerPrice = calculateOfferPrice(
      product.price,
      campaign.discountType,
      campaign.discountValue
    );

    offers.push({
      campaignId: campaign._id || '',
      productId: product.productId,
      variantId: product.variantId,
      productName: product.name,
      productImageUrl: product.imageUrl,
      regularPrice: product.price,
      discountType: campaign.discountType,
      discountValue: campaign.discountValue,
      offerPrice,
      title: product.name,
      description: product.description || '',
      badge: rec.relevance === 'high' ? 'Top Recommendation' : 'Recommended for you',
      priority: rec.relevance === 'high' ? 10 : 5,
      active: true,
      reason: rec.reason,
    });
  }

  return offers;
}
