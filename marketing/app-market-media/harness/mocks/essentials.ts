// Stand-in for @wix/essentials: serves fixture data instead of calling the app backend.
import * as data from '../fixtures';

const routes: Record<string, unknown> = {
  '/api/dashboard/overview': data.overview,
  '/api/campaigns': data.campaigns,
  '/api/settings': data.settings,
  '/api/billing': new URLSearchParams(location.search).get('billing') === 'free' ? data.billingFree : data.billing,
  '/api/recommendations': data.recommendations,
};

export const httpClient = {
  async fetchWithAuth(url: string) {
    const body = routes[new URL(url, location.href).pathname] ?? {};
    return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
  },
};

export const i18n = { getLocale: () => 'en' };
