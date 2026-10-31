import { httpClient } from '@wix/essentials';

const fetchWithAuth = httpClient.fetchWithAuth || fetch;

// Resolve API routes against the app server, not the host site origin.
const apiUrl = (path: string) => new URL(path, import.meta.url).href;

class PostPurchaseOffersElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'order-id',
      'heading',
      'heading-font',
      'heading-color',
      'subheading',
      'subheading-font',
      'subheading-color',
      'product-title-font',
      'product-title-color',
      'price-font',
      'price-color',
      'reason-font',
      'reason-color',
      'badge-bg-color',
      'badge-text-color',
      'cta-text',
      'button-font',
      'button-color',
      'button-text-color',
      'container-bg-color',
      'card-bg-color',
      'border-radius',
    ];
  }

  private offersData: any = null;
  private isLoading = false;
  private isDismissed = false;
  private isProcessingCheckout = false;
  private hasFetched = false;
  private escapeHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor() {
    super();
  }

  async connectedCallback() {
    await this.init();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.hasFetched) {
      this.render();
    }
  }

  private async init() {
    const orderId = this.getAttribute('order-id');

    if (!orderId) {
      // Do not render an offer without a real completed order.
      this.offersData = null;
      this.hasFetched = true;
      this.render();
      return;
    }

    // Live storefront with real order ID
    this.isLoading = true;
    this.render();

    try {
      const response = await fetchWithAuth(apiUrl('/api/recommendations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          sessionKey: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.offers && data.offers.length > 0) {
          this.offersData = data;
        } else {
          this.offersData = null;
        }
      } else {
        this.offersData = null;
      }
    } catch (err) {
      console.warn('Post-purchase offers fetch error:', err);
      this.offersData = null;
    } finally {
      this.isLoading = false;
      this.hasFetched = true;
      this.render();
    }
  }

  private handleDismiss() {
    this.isDismissed = true;
    this.render();

    const orderId = this.getAttribute('order-id');
    if (orderId && this.offersData?.campaign?.id) {
      fetchWithAuth(apiUrl('/api/offers/interaction'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: this.offersData.campaign.id,
          productId: this.offersData.offers[0]?.productId || 'all',
          originalOrderId: orderId,
          eventType: 'dismiss',
        }),
      }).catch(() => {});
    }
  }

  private async handleClaimOffer(offer: any) {
    if (this.isProcessingCheckout) return;

    this.isProcessingCheckout = true;
    this.render();

    const orderId = this.getAttribute('order-id');

    try {
      const response = await fetchWithAuth(apiUrl('/api/offers/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: offer.productId,
          variantId: offer.variantId,
          campaignId: this.offersData?.campaign?.id,
          offerId: offer._id,
          originalOrderId: orderId,
          offerPrice: offer.offerPrice,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || 'Checkout initiation failed');
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        // Redirect to Wix Checkout for the additional order
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (err: any) {
      alert(err.message || 'Unable to add offer to checkout. Please try again.');
      this.isProcessingCheckout = false;
      this.render();
    }
  }

  render() {
    this.removeEscapeHandler();

    if (this.isDismissed) {
      this.innerHTML = '';
      return;
    }

    if (this.isLoading) {
      this.innerHTML = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 24px; color: #666;">
          <div style="display: inline-block; width: 24px; height: 24px; border: 2px solid #ddd; border-top-color: #3899ec; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <p style="margin-top: 8px; font-size: 14px;">Finding exclusive deals for your order...</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;
      return;
    }

    if (!this.offersData || !this.offersData.offers || this.offersData.offers.length === 0) {
      this.innerHTML = '';
      return;
    }

    const { campaign, offers, source } = this.offersData;
    const heading = this.getAttribute('heading') || campaign.heading || 'A little something extra for you';
    const headingColor = this.getAttribute('heading-color') || '#111827';
    const headingFont = this.getAttribute('heading-font') || '';

    const subheading =
      this.getAttribute('subheading') ||
      campaign.subheading ||
      'Complementary picks tailored to your recent order.';
    const subheadingColor = this.getAttribute('subheading-color') || '#6b7280';
    const subheadingFont = this.getAttribute('subheading-font') || '';

    const productTitleColor = this.getAttribute('product-title-color') || '#111827';
    const productTitleFont = this.getAttribute('product-title-font') || '';

    const priceColor = this.getAttribute('price-color') || '#111827';
    const priceFont = this.getAttribute('price-font') || '';

    const reasonColor = this.getAttribute('reason-color') || '#4b5563';
    const reasonFont = this.getAttribute('reason-font') || '';

    const badgeBgColor = this.getAttribute('badge-bg-color') || '#ebf5ff';
    const badgeTextColor = this.getAttribute('badge-text-color') || '#116dff';

    const ctaText = this.getAttribute('cta-text') || campaign.ctaText || 'Claim Offer';
    const buttonColor = this.getAttribute('button-color') || '#116dff';
    const buttonTextColor = this.getAttribute('button-text-color') || '#ffffff';
    const buttonFont = this.getAttribute('button-font') || '';

    const containerBgColor = this.getAttribute('container-bg-color') || '#ffffff';
    const cardBgColor = this.getAttribute('card-bg-color') || '#ffffff';
    const borderRadius = parseInt(this.getAttribute('border-radius') || '8', 10);

    const cardsHtml = offers
      .map((offer: any, idx: number) => {
        const hasDiscount = offer.regularPrice > offer.offerPrice;
        const discountBadge =
          offer.badge ||
          (hasDiscount
            ? `SAVE ${Math.round(((offer.regularPrice - offer.offerPrice) / offer.regularPrice) * 100)}%`
            : 'Special Offer');

        return `
          <div class="ppo-card" data-index="${idx}" style="background: ${cardBgColor}; border: 1px solid #e5e7eb; border-radius: ${borderRadius}px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); position: relative; transition: transform 0.15s ease, box-shadow 0.15s ease;">
            <div>
              ${
                discountBadge
                  ? `<span style="position: absolute; top: 12px; right: 12px; background: ${badgeBgColor}; color: ${badgeTextColor}; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${discountBadge}</span>`
                  : ''
              }
              <div style="width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; background: #f9fafb; border-radius: ${Math.max(
                4,
                borderRadius - 2
              )}px; overflow: hidden; margin-bottom: 14px;">
                ${
                  offer.productImageUrl
                    ? `<img src="${offer.productImageUrl}" alt="${offer.productName}" style="max-height: 100%; max-width: 100%; object-fit: contain;" />`
                    : `<svg width="48" height="48" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
                }
              </div>
              <h3 style="${productTitleFont ? `font: ${productTitleFont};` : 'font-size: 15px; font-weight: 600;'} color: ${productTitleColor}; margin: 0 0 6px 0; line-height: 1.3;">${offer.productName}</h3>
              ${
                offer.reason
                  ? `<p style="${reasonFont ? `font: ${reasonFont};` : 'font-size: 12px;'} color: ${reasonColor}; margin: 0 0 12px 0; line-height: 1.4; display: flex; align-items: flex-start; gap: 4px;">
                      <span style="color: ${badgeTextColor}; font-weight: bold;">✦</span> <span>${offer.reason}</span>
                     </p>`
                  : ''
              }
            </div>

            <div>
              <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px;">
                <span style="${priceFont ? `font: ${priceFont};` : 'font-size: 18px; font-weight: 700;'} color: ${priceColor};">$${Number(
                  offer.offerPrice
                ).toFixed(2)}</span>
                ${
                  hasDiscount
                    ? `<span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">$${Number(
                        offer.regularPrice
                      ).toFixed(2)}</span>`
                    : ''
                }
              </div>

              <button class="ppo-claim-btn" data-index="${idx}" style="width: 100%; background: ${buttonColor}; color: ${buttonTextColor}; ${buttonFont ? `font: ${buttonFont};` : 'font-size: 14px; font-weight: 600;'} border: none; border-radius: ${Math.max(
                4,
                borderRadius - 2
              )}px; padding: 10px 16px; cursor: pointer; transition: opacity 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" ${
                this.isProcessingCheckout ? 'disabled' : ''
              }>
                ${
                  this.isProcessingCheckout
                    ? `<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;"></span> Redirecting to Checkout...`
                    : `${ctaText} →`
                }
              </button>
            </div>
          </div>
        `;
      })
      .join('');

    this.innerHTML = `
      <div class="ppo-overlay" role="presentation" style="position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(17, 24, 39, 0.62); font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box;">
        <div class="ppo-dialog" role="dialog" aria-modal="true" aria-labelledby="ppo-heading" tabindex="-1" style="position: relative; width: min(720px, 100%); max-height: min(760px, calc(100vh - 40px)); overflow: auto; background: ${containerBgColor}; border: 1px solid #e5e7eb; border-radius: ${borderRadius}px; padding: 24px; box-shadow: 0 24px 80px rgba(0,0,0,0.24); box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <h2 id="ppo-heading" style="${headingFont ? `font: ${headingFont};` : 'font-size: 18px; font-weight: 700;'} color: ${headingColor}; margin: 0;">${heading}</h2>
              </div>
              <p style="${subheadingFont ? `font: ${subheadingFont};` : 'font-size: 13px;'} color: ${subheadingColor}; margin: 0;">${subheading}</p>
            </div>
            <button class="ppo-dismiss-btn" aria-label="Dismiss offer" style="flex: 0 0 auto; background: transparent; border: none; color: #6b7280; font-size: 24px; line-height: 1; cursor: pointer; padding: 2px 4px;">&times;</button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            ${cardsHtml}
          </div>
          <button class="ppo-dismiss-link" style="display: block; margin: 18px auto 0; background: transparent; border: none; color: #6b7280; font-size: 12px; cursor: pointer; padding: 4px 8px; text-decoration: underline;">No thanks, dismiss</button>
        </div>
      </div>
    `;

    const overlay = this.querySelector('.ppo-overlay');
    const dialog = this.querySelector('.ppo-dialog') as HTMLElement | null;
    const dismiss = () => this.handleDismiss();

    this.querySelector('.ppo-dismiss-btn')?.addEventListener('click', dismiss);
    this.querySelector('.ppo-dismiss-link')?.addEventListener('click', dismiss);
    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) dismiss();
    });

    this.escapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    document.addEventListener('keydown', this.escapeHandler);
    dialog?.focus();

    const claimButtons = this.querySelectorAll('.ppo-claim-btn');
    claimButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const idx = parseInt(target.getAttribute('data-index') || '0', 10);
        const offer = offers[idx];
        if (offer) {
          this.handleClaimOffer(offer);
        }
      });
    });
  }

  private removeEscapeHandler() {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }
}

export default PostPurchaseOffersElement;
