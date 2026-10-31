// Mounts the real site plugin custom element with a sample order.
//   ?theme=brand   apply the merchant styling from theme.ts (Editor screenshot)
import PostPurchaseOffersElement from '../../../src/extensions/site/plugins/post-purchase-offers/post-purchase-offers';
import { IMAGES } from './fixtures';
import { BRAND_THEME } from './theme';

customElements.define('post-purchase-offers', PostPurchaseOffersElement);
(document.getElementById('purchased') as HTMLImageElement).src = IMAGES.headphones;

const el = document.createElement('post-purchase-offers');
el.setAttribute('order-id', 'order-10482');

if (new URLSearchParams(location.search).get('theme') === 'brand') {
  document.body.classList.add('editor');
  for (const [name, value] of Object.entries(BRAND_THEME)) el.setAttribute(name, value);
}

document.body.appendChild(el);
