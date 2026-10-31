import { extensions } from '@wix/astro/builders'

export default extensions.appTools({
  id: 'f5a51915-3302-4d36-9f9d-685af39e2037',
  name: 'post-purchase-ai',
  // learn more about JSON Schema - https://json-schema.org/overview/what-is-jsonschema
  tools: [
    {
      methodName: 'get-store-performance',
      displayName: 'Get Store Performance',
      description: 'Returns dashboard performance for post-purchase offers, including impressions, clicks, purchases, attributed revenue, conversion rate, and active campaign count. Use when a site collaborator asks how offers are performing or wants a summary of upsell results.',
      requestSchema: {
        type: 'object',
        properties: {}
      },
      responseSchema: {
        type: 'object'
      },
      activated: true
    },
    {
      methodName: 'list-offer-campaigns',
      displayName: 'List Offer Campaigns',
      description: 'Lists post-purchase offer campaigns with their names, statuses, recommendation modes, discounts, and order-value rules. Use when a site collaborator asks what campaigns exist or which campaigns are active.',
      requestSchema: {
        type: 'object',
        properties: {}
      },
      responseSchema: {
        type: 'object'
      },
      activated: true
    },
    {
      methodName: 'update-offer-settings',
      displayName: 'Update Offer Settings',
      description: 'Updates the customer-facing post-purchase offer settings, including the headline, subheadline, button colors, border radius, AI enablement, and whether recommendation reasons are shown. Use only when a site collaborator explicitly asks to change the storefront offer experience.',
      requestSchema: {
        type: 'object',
        properties: {
          aiEnabled: {
            type: 'boolean'
          },
          enableAiExplanations: {
            type: 'boolean'
          },
          headline: {
            type: 'string'
          },
          subheadline: {
            type: 'string'
          },
          buttonColor: {
            type: 'string'
          },
          buttonTextColor: {
            type: 'string'
          },
          borderRadius: {
            type: 'number'
          }
        }
      },
      responseSchema: {
        type: 'object'
      },
      activated: true
    },
  ],
});
