import { window as wixWindow } from '@wix/site-window';
import { currentCartV2 } from '@wix/ecom';
import { ecom } from '@wix/site-ecom';
import { httpClient } from '@wix/essentials';
import { detectLocale, translate, subscribeToLocaleChanges, SUPPORTED_LOCALES, type Locale } from '../../../../lib/i18n';

const fetchWithAuth = httpClient.fetchWithAuth || fetch;

// Resolve API routes against the app server, not the host site origin.
const apiUrl = (path: string) => new URL(path, import.meta.url).href;

type VariantSelection = {
  variantId: string;
};

class PostPurchaseOffersElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'locale',
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
  private processingOfferId: string | null = null;
  private processingAction: 'cart' | 'checkout' | null = null;
  private addedOfferIds = new Set<string>();
  private variantPicker: {
    offer: any;
    options: Array<{ name: string; choices: string[] }>;
    variants: Array<{ variantId: string; choices: Record<string, string> }>;
    selectedChoices: Record<string, string>;
    resolve: (selection: VariantSelection | null) => void;
  } | null = null;
  private hasFetched = false;
  private isInitializing = false;
  private escapeHandler: ((event: KeyboardEvent) => void) | null = null;
  private locale: Locale = detectLocale();
  private unsubscribeLocale: (() => void) | null = null;

  constructor() {
    super();
  }

  private formatLogDetails(details: unknown): string {
    if (details instanceof Error) return details.message;
    if (typeof details === 'string') return details;

    try {
      return JSON.stringify(details);
    } catch {
      return String(details);
    }
  }

  private log(message: string, details?: unknown) {
    const suffix = details === undefined ? '' : ` ${this.formatLogDetails(details)}`;
    console.info(`[PostPurchaseOffers] ${message}${suffix}`);
  }

  private t(key: Parameters<typeof translate>[1], values?: Record<string, string | number>): string {
    return translate(this.locale, key, values);
  }

  private formatPrice(amount: number, currency?: string): string {
    if (!currency) return amount.toFixed(2);
    try {
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  private async isEditorMode(): Promise<boolean> {
    try {
      const mode = await wixWindow.viewMode();
      const isEditor = mode === 'Editor' || mode === 'Preview';
      this.log('Wix view mode detected', { mode, isEditor });
      return isEditor;
    } catch (error) {
      console.warn(`[PostPurchaseOffers] Could not detect Wix view mode ${this.formatLogDetails(error)}`);
      return false;
    }
  }

  private loadEditorPreview() {
    this.log('Loading editor preview data');
    const headingAttr = this.getAttribute('heading');
    const subheadingAttr = this.getAttribute('subheading');
    const ctaAttr = this.getAttribute('cta-text');

    const isDefaultHeading = !headingAttr ||
      headingAttr === 'Special Offer' ||
      headingAttr === 'Post-Purchase Deals' ||
      headingAttr === 'A little something extra for you' ||
      SUPPORTED_LOCALES.some((loc) => translate(loc, 'previewHeading') === headingAttr || translate(loc, 'specialOffer') === headingAttr);

    const isDefaultSubheading = !subheadingAttr ||
      subheadingAttr === 'A little something extra for you!' ||
      subheadingAttr === 'Complementary picks tailored to your order.' ||
      subheadingAttr === 'Exclusive post-purchase deals selected specifically for your order.' ||
      subheadingAttr === 'Add these complementary items to your order with one click.' ||
      SUPPORTED_LOCALES.some((loc) => translate(loc, 'previewSubheading') === subheadingAttr);

    const isDefaultCta = !ctaAttr ||
      ctaAttr === 'Claim Offer' ||
      ctaAttr === 'Add to Order' ||
      ctaAttr === 'Add to Order →' ||
      SUPPORTED_LOCALES.some((loc) => translate(loc, 'claimOffer') === ctaAttr || translate(loc, 'addToOrder') === ctaAttr);

    this.offersData = {
      campaign: {
        id: 'preview-campaign',
        name: 'Post-Purchase Deals',
        heading: isDefaultHeading ? this.t('previewHeading') : headingAttr,
        subheading: isDefaultSubheading ? this.t('previewSubheading') : subheadingAttr,
        ctaText: isDefaultCta ? this.t('claimOffer') : ctaAttr,
      },
      offers: [
        {
          _id: 'preview-offer-1',
          productId: 'preview-product-1',
          productName: this.t('previewProduct'),
          productImageUrl:
            'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80',
          regularPrice: 29.99,
          offerPrice: 22.49,
          discountType: 'PERCENTAGE',
          discountValue: 25,
          badge: this.t('savePercent', { percent: 25 }),
          reason: this.t('previewReason'),
        },
      ],
      source: 'preview',
    };
  }

  async connectedCallback() {
    this.log('Plugin mounted', {
      hasOrderId: Boolean(this.getAttribute('order-id')),
      hostTag: this.tagName.toLowerCase(),
    });

    const attrLocale = this.getAttribute('locale');
    if (attrLocale && SUPPORTED_LOCALES.includes(attrLocale as Locale)) {
      this.locale = attrLocale as Locale;
    }

    this.unsubscribeLocale = subscribeToLocaleChanges((newLocale) => {
      if (this.locale !== newLocale) {
        this.log('Locale changed via subscription', { from: this.locale, to: newLocale });
        this.locale = newLocale;
        if (this.offersData?.source === 'preview') {
          this.loadEditorPreview();
        }
        if (this.hasFetched) {
          this.render();
        }
      }
    });

    await this.startInit();
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    this.unsubscribeLocale = null;
    this.removeEscapeHandler();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'locale' && newValue && newValue !== oldValue) {
      if (SUPPORTED_LOCALES.includes(newValue as Locale)) {
        this.locale = newValue as Locale;
        if (this.offersData?.source === 'preview') {
          this.loadEditorPreview();
        }
        if (this.hasFetched) {
          this.render();
        }
      }
    }
    if (name === 'order-id') {
      this.log('order-id attribute changed', {
        hadOrderId: Boolean(oldValue),
        hasOrderId: Boolean(newValue),
        hasFetched: this.hasFetched,
      });

      // Wix can attach host props immediately after the element mounts. Retry
      // when the order ID arrives instead of keeping the initial empty state.
      if (newValue && newValue !== oldValue) {
        this.hasFetched = false;
        void this.startInit();
      }
    }
    if (oldValue !== newValue && this.hasFetched) {
      this.render();
    }
  }

  private async startInit() {
    if (this.isInitializing) return;
    this.isInitializing = true;
    try {
      await this.init();
    } finally {
      this.isInitializing = false;
    }
  }

  private async init() {
    const attrLocale = this.getAttribute('locale');
    if (attrLocale && SUPPORTED_LOCALES.includes(attrLocale as Locale)) {
      this.locale = attrLocale as Locale;
    } else {
      this.locale = detectLocale();
    }
    const isEditor = await this.isEditorMode();
    // Read the prop after the async view-mode check because Wix may attach
    // order-id after connectedCallback has already fired.
    const orderId = this.getAttribute('order-id');
    this.log('Initializing plugin', {
      hasOrderId: Boolean(orderId),
      isEditor,
      apiUrl: apiUrl('/api/recommendations'),
    });

    if (isEditor && !orderId) {
      try {
        const setRes = await fetchWithAuth(apiUrl('/api/settings')).then((r) => (r.ok ? r.json() : null));
        if (setRes?.locale && SUPPORTED_LOCALES.includes(setRes.locale as Locale) && !attrLocale) {
          this.locale = setRes.locale as Locale;
        }
      } catch {}
      this.loadEditorPreview();
      this.hasFetched = true;
      this.render();
      return;
    }

    if (!orderId) {
      // Do not render an offer without a real completed order.
      this.log('No order-id found; rendering empty state');
      this.offersData = null;
      this.hasFetched = true;
      this.render();
      return;
    }

    // Live storefront with real order ID
    this.isLoading = true;
    this.log('Fetching recommendations');
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
      this.log('Recommendations response received', {
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
      });

      if (response.ok) {
        const data = await response.json();
        this.log('Recommendations payload received', {
          hasCampaign: Boolean(data?.campaign),
          offerCount: Array.isArray(data?.offers) ? data.offers.length : 0,
          source: data?.source,
          locale: data?.locale,
        });
        if (data?.locale && SUPPORTED_LOCALES.includes(data.locale as Locale) && !attrLocale) {
          this.locale = data.locale as Locale;
        }
        if (data && data.offers && data.offers.length > 0) {
          this.offersData = data;
        } else {
          this.log('Recommendations returned no offers');
          this.offersData = null;
        }
      } else {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        this.log('Recommendations request failed', `status=${response.status} body=${errorText.slice(0, 500)}`);
        this.offersData = null;
      }
    } catch (err) {
      console.error(`[PostPurchaseOffers] Recommendations request threw an error ${this.formatLogDetails(err)}`);
      this.offersData = null;
    } finally {
      this.isLoading = false;
      this.hasFetched = true;
      this.log('Recommendation request finished', {
        hasOffers: Boolean(this.offersData?.offers?.length),
      });
      this.render();
    }
  }

  private handleDismiss() {
    this.log('Offer dismissed', {
      hasCampaign: Boolean(this.offersData?.campaign?.id),
      offerCount: this.offersData?.offers?.length || 0,
    });
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
      }).catch((err) => {
        console.warn(`[PostPurchaseOffers] Dismiss event failed ${this.formatLogDetails(err)}`);
      });
    }
  }

  private async handleClaimOffer(offer: any) {
    if (this.processingOfferId) {
      this.log('Ignoring duplicate claim click while checkout is processing');
      return;
    }

    const offerId = this.getOfferKey(offer);

    this.log('Claim offer clicked', {
      hasProductId: Boolean(offer?.productId),
      hasVariantId: Boolean(offer?.variantId),
      offerPrice: offer?.offerPrice,
      offerId,
    });

    const selection = await this.getVariantSelection(offer);
    if (!selection) return;

    this.processingOfferId = offerId;
    this.processingAction = 'checkout';
    this.render();

    const orderId = this.getAttribute('order-id');

    try {
      const response = await fetchWithAuth(apiUrl('/api/offers/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: offer.productId,
          variantId: selection.variantId,
          campaignId: this.offersData?.campaign?.id,
          offerId: offer._id,
          originalOrderId: orderId,
          offerPrice: offer.offerPrice,
          currency: offer.currency,
        }),
      });
      this.log('Checkout response received', {
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || this.t('unableCheckout'));
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        this.log('Checkout URL received; redirecting');
        // Redirect to Wix Checkout for the additional order
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error(this.t('unableCheckout'));
    } catch (err: any) {
      console.error(`[PostPurchaseOffers] Checkout request failed ${this.formatLogDetails(err)}`);
      alert(err.message || this.t('unableCheckout'));
      this.processingOfferId = null;
      this.processingAction = null;
      this.render();
    }
  }

  private async handleAddToCart(offer: any) {
    if (this.processingOfferId) return;

    const offerId = this.getOfferKey(offer);
    if (!offer?.productId || this.addedOfferIds.has(offerId)) return;

    this.log('Add to cart clicked', {
      hasProductId: Boolean(offer.productId),
      hasVariantId: Boolean(offer.variantId),
      offerId,
    });
    const selection = await this.getVariantSelection(offer);
    if (!selection) return;

    this.processingOfferId = offerId;
    this.processingAction = 'cart';
    this.render();

    try {
      await currentCartV2.addLineItemsToCurrentCart({
        catalogItems: [
          {
            catalogReference: {
              catalogItemId: offer.productId,
              appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
              options: { variantId: selection.variantId },
            },
            quantity: 1,
          },
        ],
      });
      // Wix's site-ecom module refreshes the cart icon/side cart and emits the
      // cart-change event after a Current Cart API mutation.
      await ecom.refreshCart();
      this.addedOfferIds.add(offerId);
      this.log('Offer added to current cart', { offerId });
    } catch (err: any) {
      console.error(`[PostPurchaseOffers] Add to cart failed ${this.formatLogDetails(err)}`);
      alert(err?.message || this.t('unableCart'));
    } finally {
      this.processingOfferId = null;
      this.processingAction = null;
      this.render();
    }
  }

  private async getVariantSelection(offer: any): Promise<VariantSelection | null> {
    try {
      const response = await fetchWithAuth(
        apiUrl(`/api/product-variants?productId=${encodeURIComponent(String(offer.productId))}`),
      );
      if (!response.ok) throw new Error(this.t('unableOptions'));
      const data = await response.json();
      const variants = Array.isArray(data?.variants) ? data.variants : [];
      const options = Array.isArray(data?.options) ? data.options : [];

      if (variants.length === 0) {
        throw new Error(this.t('unavailableCombination'));
      }
      if (options.length === 0) {
        return { variantId: offer.variantId || variants[0].variantId };
      }

      return await new Promise<VariantSelection | null>((resolve) => {
        this.variantPicker = {
          offer,
          options,
          variants,
          selectedChoices: {},
          resolve,
        };
        this.render();
      });
    } catch (err: any) {
      console.error(`[PostPurchaseOffers] Variant lookup failed ${this.formatLogDetails(err)}`);
      alert(err?.message || this.t('unableOptions'));
      return null;
    }
  }

  private cancelVariantSelection() {
    const picker = this.variantPicker;
    if (!picker) return;
    this.variantPicker = null;
    picker.resolve(null);
    this.render();
  }

  private confirmVariantSelection() {
    const picker = this.variantPicker;
    if (!picker) return;

    const hasAllChoices = picker.options.every((option) => Boolean(picker.selectedChoices[option.name]));
    if (!hasAllChoices) {
      alert(this.t('selectOption'));
      return;
    }

    const selectedVariant = picker.variants.find((variant) =>
      picker.options.every((option) => variant.choices[option.name] === picker.selectedChoices[option.name]),
    );
    if (!selectedVariant) {
      alert(this.t('unavailableCombination'));
      return;
    }

    this.variantPicker = null;
    picker.resolve({ variantId: selectedVariant.variantId });
    this.render();
  }

  private getOfferKey(offer: any): string {
    return String(offer?._id || offer?.productId || 'unknown-offer');
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  render() {
    const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) => translate(this.locale, key, values);
    this.removeEscapeHandler();

    if (this.isDismissed) {
      this.log('Render skipped because offer was dismissed');
      this.innerHTML = '';
      return;
    }

    if (this.isLoading) {
      this.log('Rendering loading state');
      this.innerHTML = `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 24px; color: #666;">
          <div style="display: inline-block; width: 24px; height: 24px; border: 2px solid #ddd; border-top-color: #3899ec; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
          <p style="margin-top: 8px; font-size: 14px;">${t('findingDeals')}</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      `;
      return;
    }

    if (!this.offersData || !this.offersData.offers || this.offersData.offers.length === 0) {
      this.log('Rendering empty state', {
        hasOffersData: Boolean(this.offersData),
      });
      this.innerHTML = '';
      return;
    }

    const { campaign, offers, source } = this.offersData;
    this.log('Rendering offer popup', {
      campaignId: campaign?.id,
      offerCount: offers.length,
      source,
    });
    const isPreview = source === 'preview';

    const isDefaultHeadingValue = (val: string | null | undefined): boolean => {
      if (!val) return true;
      const trimmed = val.trim();
      return (
        trimmed === 'Special Offer' ||
        trimmed === 'Post-Purchase Deals' ||
        trimmed === 'A little something extra for you' ||
        trimmed === 'Special post-purchase deal' ||
        SUPPORTED_LOCALES.some(
          (loc) => translate(loc, 'previewHeading') === trimmed || translate(loc, 'specialOffer') === trimmed
        )
      );
    };

    const isDefaultSubheadingValue = (val: string | null | undefined): boolean => {
      if (!val) return true;
      const trimmed = val.trim();
      return (
        trimmed === 'A little something extra for you!' ||
        trimmed === 'Complementary picks tailored to your order.' ||
        trimmed === 'Exclusive post-purchase deals selected specifically for your order.' ||
        trimmed === 'Add these complementary items to your order with one click.' ||
        SUPPORTED_LOCALES.some((loc) => translate(loc, 'previewSubheading') === trimmed)
      );
    };

    const isDefaultCtaValue = (val: string | null | undefined): boolean => {
      if (!val) return true;
      const trimmed = val.trim();
      return (
        trimmed === 'Claim Offer' ||
        trimmed === 'Add to Order' ||
        trimmed === 'Add to Order →' ||
        SUPPORTED_LOCALES.some(
          (loc) => translate(loc, 'claimOffer') === trimmed || translate(loc, 'addToOrder') === trimmed
        )
      );
    };

    const headingAttr = this.getAttribute('heading');
    const heading = isDefaultHeadingValue(headingAttr)
      ? (isDefaultHeadingValue(campaign?.heading) ? this.t('previewHeading') : campaign.heading)
      : headingAttr!;

    const headingColor = this.getAttribute('heading-color') || '#111827';
    const headingFont = this.getAttribute('heading-font') || '';

    const subheadingAttr = this.getAttribute('subheading');
    const subheading = isDefaultSubheadingValue(subheadingAttr)
      ? (isDefaultSubheadingValue(campaign?.subheading) ? this.t('previewSubheading') : campaign.subheading)
      : subheadingAttr!;

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

    const ctaAttr = this.getAttribute('cta-text');
    const ctaText = isDefaultCtaValue(ctaAttr)
      ? (isDefaultCtaValue(campaign?.ctaText) ? this.t('claimOffer') : campaign.ctaText)
      : ctaAttr!;

    const buttonColor = this.getAttribute('button-color') || '#116dff';
    const buttonTextColor = this.getAttribute('button-text-color') || '#ffffff';
    const buttonFont = this.getAttribute('button-font') || '';

    const containerBgColor = this.getAttribute('container-bg-color') || '#ffffff';
    const cardBgColor = this.getAttribute('card-bg-color') || '#ffffff';
    const borderRadius = parseInt(this.getAttribute('border-radius') || '8', 10);

    const cardsHtml = offers
      .map((offer: any, idx: number) => {
        const offerId = this.getOfferKey(offer);
        const isOfferProcessing = this.processingOfferId === offerId;
        const isCartProcessing = isOfferProcessing && this.processingAction === 'cart';
        const isCheckoutProcessing = isOfferProcessing && this.processingAction === 'checkout';
        const isOfferAdded = this.addedOfferIds.has(offerId);
        const hasDiscount = offer.regularPrice > offer.offerPrice;

        const isDefaultProductValue = (name: string): boolean => {
          if (!name) return true;
          const trimmed = name.trim();
          return (
            trimmed === 'High-Speed Fast Charger & Cable' ||
            trimmed === 'Fast Charger & High-Speed Cable' ||
            trimmed.includes('Fast Charger') ||
            trimmed.includes('Schnellladegerät') ||
            trimmed.includes('Chargeur rapide') ||
            trimmed.includes('Cargador rápido') ||
            trimmed.includes('Carregador rápido') ||
            SUPPORTED_LOCALES.some((loc) => translate(loc, 'previewProduct') === trimmed)
          );
        };

        const productName =
          isPreview || offer.productId === 'preview-product-1' || isDefaultProductValue(offer.productName)
            ? t('previewProduct')
            : offer.productName;

        const resolveBadgeText = (rawBadge?: string): string => {
          if (!rawBadge) {
            return hasDiscount
              ? t('savePercent', {
                  percent:
                    offer.discountValue ||
                    Math.round(((offer.regularPrice - offer.offerPrice) / offer.regularPrice) * 100) ||
                    25,
                })
              : t('specialOffer');
          }

          const trimmed = rawBadge.trim();
          if (
            trimmed === '25% OFF' ||
            trimmed.endsWith('% OFF') ||
            trimmed.startsWith('SAVE ') ||
            trimmed.startsWith('AHORRA ') ||
            trimmed.startsWith('POUPE ') ||
            trimmed.startsWith('RISPARMIA ') ||
            trimmed.startsWith('BESPAAR ') ||
            trimmed.startsWith('OSZCZĘDŹ ') ||
            trimmed.startsWith('SPARA ') ||
            trimmed.startsWith('SPAR ') ||
            trimmed.startsWith('SÄÄSTÄ ') ||
            trimmed.startsWith('UŠETŘETE ') ||
            trimmed.startsWith('立省') ||
            trimmed.startsWith('وفّر') ||
            trimmed.startsWith('חיסכון') ||
            trimmed.startsWith('СКИДКА') ||
            trimmed.endsWith('SPAREN') ||
            trimmed.endsWith('off') ||
            trimmed.endsWith('OFF') ||
            trimmed.endsWith('할인') ||
            trimmed.endsWith('オフ')
          ) {
            return t('savePercent', {
              percent:
                offer.discountValue ||
                Math.round(((offer.regularPrice - offer.offerPrice) / offer.regularPrice) * 100) ||
                25,
            });
          }
          if (trimmed === 'Special Offer' || SUPPORTED_LOCALES.some((loc) => translate(loc, 'specialOffer') === trimmed)) {
            return t('specialOffer');
          }
          if (trimmed === 'Frequently paired' || SUPPORTED_LOCALES.some((loc) => translate(loc, 'frequentlyPaired') === trimmed)) {
            return t('frequentlyPaired');
          }
          if (trimmed === 'Top Recommendation' || SUPPORTED_LOCALES.some((loc) => translate(loc, 'topRecommendation') === trimmed)) {
            return t('topRecommendation');
          }
          if (trimmed === 'Recommended for you' || SUPPORTED_LOCALES.some((loc) => translate(loc, 'recommendedForYou') === trimmed)) {
            return t('recommendedForYou');
          }
          if (trimmed === 'Selected by you' || SUPPORTED_LOCALES.some((loc) => translate(loc, 'selectedByYou') === trimmed)) {
            return t('selectedByYou');
          }
          return rawBadge;
        };

        const localizedDiscountBadge = resolveBadgeText(offer.badge);

        const resolveReasonText = (rawReason?: string): string | null => {
          if (!rawReason) return null;
          const trimmed = rawReason.replace(/^✦\s*/, '').trim();
          if (
            trimmed.includes('charging accessory') ||
            trimmed.includes('Ladezubehör') ||
            trimmed.includes('Accessoire de charge') ||
            trimmed.includes('Accesorio de carga') ||
            trimmed.includes('Acessório de carregamento') ||
            trimmed.includes('Accessorio ideale') ||
            SUPPORTED_LOCALES.some((loc) => translate(loc, 'previewReason').replace(/^✦\s*/, '').trim() === trimmed)
          ) {
            return t('previewReason').replace(/^✦\s*/, '').trim();
          }
          if (
            trimmed === 'Popular add-on chosen for orders like yours.' ||
            SUPPORTED_LOCALES.some((loc) => translate(loc, 'popularAddonReason') === trimmed)
          ) {
            return t('popularAddonReason');
          }
          if (
            trimmed === 'Selected manually by the merchant.' ||
            SUPPORTED_LOCALES.some((loc) => translate(loc, 'merchantSelectedReason') === trimmed)
          ) {
            return t('merchantSelectedReason');
          }
          return trimmed;
        };

        const reasonText =
          isPreview || offer.productId === 'preview-product-1'
            ? t('previewReason').replace(/^✦\s*/, '').trim()
            : resolveReasonText(offer.reason);

        return `
          <div class="ppo-card" data-index="${idx}" style="background: ${cardBgColor}; border: 1px solid #e5e7eb; border-radius: ${borderRadius}px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.04); position: relative; transition: transform 0.15s ease, box-shadow 0.15s ease;">
            <div>
              ${
                localizedDiscountBadge
                  ? `<span style="position: absolute; top: 12px; right: 12px; background: ${badgeBgColor}; color: ${badgeTextColor}; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${localizedDiscountBadge}</span>`
                  : ''
              }
              <div style="width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; background: #f9fafb; border-radius: ${Math.max(
                4,
                borderRadius - 2
              )}px; overflow: hidden; margin-bottom: 14px;">
                ${
                  offer.productImageUrl
                    ? `<img src="${offer.productImageUrl}" alt="${this.escapeHtml(productName)}" style="max-height: 100%; max-width: 100%; object-fit: contain;" />`
                    : `<svg width="48" height="48" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
                }
              </div>
              <h3 style="${productTitleFont ? `font: ${productTitleFont};` : 'font-size: 15px; font-weight: 600;'} color: ${productTitleColor}; margin: 0 0 6px 0; line-height: 1.3;">${this.escapeHtml(productName)}</h3>
              ${
                reasonText
                  ? `<p style="${reasonFont ? `font: ${reasonFont};` : 'font-size: 12px;'} color: ${reasonColor}; margin: 0 0 12px 0; line-height: 1.4; display: flex; align-items: flex-start; gap: 4px;">
                      <span style="color: ${badgeTextColor}; font-weight: bold;">✦</span> <span>${this.escapeHtml(reasonText)}</span>
                     </p>`
                  : ''
              }
            </div>

            <div>
              <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px;">
                <span style="${priceFont ? `font: ${priceFont};` : 'font-size: 18px; font-weight: 700;'} color: ${priceColor};">${this.escapeHtml(this.formatPrice(Number(offer.offerPrice), offer.currency))}</span>
                ${
                  hasDiscount
                    ? `<span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">${this.escapeHtml(this.formatPrice(Number(offer.regularPrice), offer.currency))}</span>`
                    : ''
                }
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
              <button class="ppo-add-cart-btn" data-index="${idx}" style="width: 100%; background: transparent; color: ${buttonColor}; ${buttonFont ? `font: ${buttonFont};` : 'font-size: 14px; font-weight: 600;'} border: 1px solid ${buttonColor}; border-radius: ${Math.max(
                4,
                borderRadius - 2
              )}px; padding: 10px 16px; cursor: pointer; transition: opacity 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" ${
                isOfferProcessing || isOfferAdded ? 'disabled' : ''
              }>
                ${
                  isOfferAdded
                    ? t('addedToCart')
                    : isCartProcessing
                      ? `<span aria-label="${t('loading')}" style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(17,24,39,0.25); border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite;"></span>`
                      : t('addToCart')
                }
              </button>
              <button class="ppo-claim-btn" data-index="${idx}" style="width: 100%; background: ${buttonColor}; color: ${buttonTextColor}; ${buttonFont ? `font: ${buttonFont};` : 'font-size: 14px; font-weight: 600;'} border: none; border-radius: ${Math.max(
                4,
                borderRadius - 2
              )}px; padding: 10px 16px; cursor: pointer; transition: opacity 0.15s ease; display: flex; align-items: center; justify-content: center; gap: 6px;" ${
                isOfferProcessing ? 'disabled' : ''
              }>
                ${isCheckoutProcessing
                  ? `<span aria-label="${t('loading')}" style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;"></span>`
                  : `${ctaText} →`}
              </button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    const variantPickerHtml = this.variantPicker
      ? `
        <div class="ppo-variant-backdrop" style="position: fixed; inset: 0; z-index: 2147483648; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(17, 24, 39, 0.62);">
          <div class="ppo-variant-dialog" role="dialog" aria-modal="true" aria-labelledby="ppo-variant-heading" style="width: min(420px, 100%); background: #fff; border-radius: ${borderRadius}px; padding: 22px; box-shadow: 0 24px 80px rgba(0,0,0,0.24); font-family: Arial, sans-serif;">
            <h3 id="ppo-variant-heading" style="margin: 0 0 6px; color: ${headingColor}; font-size: 18px;">${t('chooseOptions')}</h3>
            <p style="margin: 0 0 18px; color: #6b7280; font-size: 13px;">${this.escapeHtml(this.variantPicker.offer.productName)}</p>
            ${this.variantPicker.options.map((option) => `
              <label style="display: block; margin-bottom: 14px; color: ${productTitleColor}; font-size: 13px; font-weight: 600;">
                ${this.escapeHtml(option.name)}
                <select class="ppo-variant-select" data-option-name="${this.escapeHtml(option.name)}" style="display: block; width: 100%; margin-top: 6px; padding: 9px; border: 1px solid #d1d5db; border-radius: 4px; background: #fff; color: #111827;">
                  <option value="">${this.escapeHtml(t('chooseOption', { option: option.name }))}</option>
                  ${option.choices.map((choice) => `<option value="${this.escapeHtml(choice)}" ${this.variantPicker?.selectedChoices[option.name] === choice ? 'selected' : ''}>${this.escapeHtml(choice)}</option>`).join('')}
                </select>
              </label>
            `).join('')}
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
              <button class="ppo-variant-cancel" style="background: transparent; border: 1px solid #d1d5db; color: #374151; border-radius: 4px; padding: 9px 14px; cursor: pointer;">${t('cancel')}</button>
              <button class="ppo-variant-confirm" style="background: ${buttonColor}; color: ${buttonTextColor}; border: none; border-radius: 4px; padding: 9px 14px; cursor: pointer;">${t('continue')}</button>
            </div>
          </div>
        </div>
      `
      : '';

    this.innerHTML = `
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      <div class="ppo-overlay" role="presentation" style="position: fixed; inset: 0; z-index: 2147483647; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(17, 24, 39, 0.62); font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box;">
        <div class="ppo-dialog" role="dialog" aria-modal="true" aria-labelledby="ppo-heading" tabindex="-1" style="position: relative; width: min(720px, 100%); max-height: min(760px, calc(100vh - 40px)); overflow: auto; background: ${containerBgColor}; border: 1px solid #e5e7eb; border-radius: ${borderRadius}px; padding: 24px; box-shadow: 0 24px 80px rgba(0,0,0,0.24); box-sizing: border-box;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <h2 id="ppo-heading" style="${headingFont ? `font: ${headingFont};` : 'font-size: 18px; font-weight: 700;'} color: ${headingColor}; margin: 0;">${heading}</h2>
              </div>
              <p style="${subheadingFont ? `font: ${subheadingFont};` : 'font-size: 13px;'} color: ${subheadingColor}; margin: 0;">${subheading}</p>
            </div>
            <button class="ppo-dismiss-btn" aria-label="${t('dismissOffer')}" style="flex: 0 0 auto; background: transparent; border: none; color: #6b7280; font-size: 24px; line-height: 1; cursor: pointer; padding: 2px 4px;">&times;</button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
            ${cardsHtml}
          </div>
          <button class="ppo-dismiss-link" style="display: block; margin: 18px auto 0; background: transparent; border: none; color: #6b7280; font-size: 12px; cursor: pointer; padding: 4px 8px; text-decoration: underline;">${t('noThanks')}</button>
        </div>
      </div>
      ${variantPickerHtml}
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

    const addCartButtons = this.querySelectorAll('.ppo-add-cart-btn');
    addCartButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const idx = parseInt(target.getAttribute('data-index') || '0', 10);
        const offer = offers[idx];
        if (offer) void this.handleAddToCart(offer);
      });
    });

    this.querySelector('.ppo-variant-cancel')?.addEventListener('click', () => this.cancelVariantSelection());
    this.querySelector('.ppo-variant-confirm')?.addEventListener('click', () => this.confirmVariantSelection());
    this.querySelectorAll('.ppo-variant-select').forEach((select) => {
      select.addEventListener('change', (event) => {
        if (!this.variantPicker) return;
        const target = event.currentTarget as HTMLSelectElement;
        const optionName = target.getAttribute('data-option-name');
        if (optionName) this.variantPicker.selectedChoices[optionName] = target.value;
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
