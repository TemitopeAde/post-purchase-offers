// Stand-in for @wix/site-window: behave like the live site so real offers are fetched.
export const window = { viewMode: async () => 'Site' };
