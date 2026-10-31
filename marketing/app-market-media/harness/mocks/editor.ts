// Stand-in for @wix/editor: the settings panel reads the brand theme used in the screenshots.
import { BRAND_THEME } from '../theme';

export const widget = {
  getProp: async (name: string) => BRAND_THEME[name],
  setProp: async () => {},
};

export const inputs = {
  selectColor: () => {},
  selectFont: () => {},
};
