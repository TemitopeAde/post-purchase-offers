import { type FC, useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { widget, inputs } from '@wix/editor';
import {
  SidePanel,
  WixDesignSystemProvider,
  Input,
  FormField,
  FillPreview,
  Slider,
  Button,
  Text,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { detectLocale, translate } from '../../../../lib/i18n';

const locale = detectLocale();
const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) => translate(locale, key, values);

interface ColorPickerRowProps {
  label: string;
  color: string;
  onChange: (val: string) => void;
}

const ColorPickerRow: FC<ColorPickerRowProps> = ({ label, color, onChange }) => (
  <SidePanel.Field>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text size="small">{label}</Text>
      <div style={{ width: 28, height: 28, borderRadius: 4, overflow: 'hidden', border: '1px solid #dcdcdc' }}>
        <FillPreview
          fill={color}
          onClick={() =>
            inputs.selectColor(color, {
              onChange: (val) => val && onChange(val),
            })
          }
        />
      </div>
    </div>
  </SidePanel.Field>
);

interface FontPickerRowProps {
  label: string;
  font: string;
  onChange: (val: string) => void;
}

const FontPickerRow: FC<FontPickerRowProps> = ({ label, font, onChange }) => (
  <SidePanel.Field>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
      <Text size="small">{label}</Text>
      <Button
        size="tiny"
        priority="secondary"
        onClick={() =>
          inputs.selectFont(
            { font },
            {
              onChange: (value: any) => {
                const fontString = value?.font || '';
                onChange(fontString);
              },
            }
          )
        }
      >
        {font ? t('editFont') : t('selectFont')}
      </Button>
    </div>
  </SidePanel.Field>
);

const Panel: FC = () => {
  // Texts
  const [heading, setHeading] = useState(t('previewHeading'));
  const [subheading, setSubheading] = useState(t('previewSubheading'));
  const [ctaText, setCtaText] = useState(t('claimOffer'));

  // Fonts
  const [headingFont, setHeadingFont] = useState('');
  const [subheadingFont, setSubheadingFont] = useState('');
  const [productTitleFont, setProductTitleFont] = useState('');
  const [priceFont, setPriceFont] = useState('');
  const [reasonFont, setReasonFont] = useState('');
  const [buttonFont, setButtonFont] = useState('');

  // Colors
  const [headingColor, setHeadingColor] = useState('#111827');
  const [subheadingColor, setSubheadingColor] = useState('#6b7280');
  const [productTitleColor, setProductTitleColor] = useState('#111827');
  const [priceColor, setPriceColor] = useState('#111827');
  const [reasonColor, setReasonColor] = useState('#4b5563');
  const [badgeBgColor, setBadgeBgColor] = useState('#ebf5ff');
  const [badgeTextColor, setBadgeTextColor] = useState('#116dff');
  const [buttonColor, setButtonColor] = useState('#116dff');
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
  const [containerBgColor, setContainerBgColor] = useState('#ffffff');
  const [cardBgColor, setCardBgColor] = useState('#ffffff');

  // Layout
  const [borderRadius, setBorderRadius] = useState(8);

  useEffect(() => {
    // Load existing properties from custom element instance
    widget.getProp('heading').then((v) => v && setHeading(v));
    widget.getProp('subheading').then((v) => v && setSubheading(v));
    widget.getProp('cta-text').then((v) => v && setCtaText(v));

    widget.getProp('heading-font').then((v) => v && setHeadingFont(v));
    widget.getProp('subheading-font').then((v) => v && setSubheadingFont(v));
    widget.getProp('product-title-font').then((v) => v && setProductTitleFont(v));
    widget.getProp('price-font').then((v) => v && setPriceFont(v));
    widget.getProp('reason-font').then((v) => v && setReasonFont(v));
    widget.getProp('button-font').then((v) => v && setButtonFont(v));

    widget.getProp('heading-color').then((v) => v && setHeadingColor(v));
    widget.getProp('subheading-color').then((v) => v && setSubheadingColor(v));
    widget.getProp('product-title-color').then((v) => v && setProductTitleColor(v));
    widget.getProp('price-color').then((v) => v && setPriceColor(v));
    widget.getProp('reason-color').then((v) => v && setReasonColor(v));
    widget.getProp('badge-bg-color').then((v) => v && setBadgeBgColor(v));
    widget.getProp('badge-text-color').then((v) => v && setBadgeTextColor(v));
    widget.getProp('button-color').then((v) => v && setButtonColor(v));
    widget.getProp('button-text-color').then((v) => v && setButtonTextColor(v));
    widget.getProp('container-bg-color').then((v) => v && setContainerBgColor(v));
    widget.getProp('card-bg-color').then((v) => v && setCardBgColor(v));
    widget.getProp('border-radius').then((v) => v && setBorderRadius(Number(v)));
  }, []);

  const handleFontUpdate = useCallback(
    (propName: string, fontVal: string, setter: (val: string) => void) => {
      setter(fontVal);
      widget.setProp(propName, fontVal);

      // Preload fonts for custom element rendering
      const currentFonts = [
        propName === 'heading-font' ? fontVal : headingFont,
        propName === 'subheading-font' ? fontVal : subheadingFont,
        propName === 'product-title-font' ? fontVal : productTitleFont,
        propName === 'price-font' ? fontVal : priceFont,
        propName === 'reason-font' ? fontVal : reasonFont,
        propName === 'button-font' ? fontVal : buttonFont,
      ].filter(Boolean);

      if (typeof (widget as any).setPreloadFonts === 'function') {
        (widget as any).setPreloadFonts(currentFonts).catch(console.error);
      }
    },
    [headingFont, subheadingFont, productTitleFont, priceFont, reasonFont, buttonFont]
  );

  const handleColorUpdate = useCallback(
    (propName: string, colorVal: string, setter: (val: string) => void) => {
      setter(colorVal);
      widget.setProp(propName, colorVal);
    },
    []
  );

  return (
    <WixDesignSystemProvider>
      <SidePanel width="320px" height="100vh">
        <SidePanel.Header title={t('postPurchaseSettings')} />
        <SidePanel.Content stretchVertically>
          {/* HEADLINE SECTION */}
          <SidePanel.Section title={t('mainHeading')}>
            <SidePanel.Field>
              <FormField label={t('headingText')}>
                <Input
                  type="text"
                  value={heading}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setHeading(e.target.value);
                    widget.setProp('heading', e.target.value);
                  }}
                  aria-label={t('headingText')}
                />
              </FormField>
            </SidePanel.Field>
            <FontPickerRow
              label={t('headingFont')}
              font={headingFont}
              onChange={(f) => handleFontUpdate('heading-font', f, setHeadingFont)}
            />
            <ColorPickerRow
              label={t('headingColor')}
              color={headingColor}
              onChange={(c) => handleColorUpdate('heading-color', c, setHeadingColor)}
            />
          </SidePanel.Section>

          {/* SUBHEADING SECTION */}
          <SidePanel.Section title={t('subheading')}>
            <SidePanel.Field>
              <FormField label={t('subheadingText')}>
                <Input
                  type="text"
                  value={subheading}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSubheading(e.target.value);
                    widget.setProp('subheading', e.target.value);
                  }}
                  aria-label={t('subheadingText')}
                />
              </FormField>
            </SidePanel.Field>
            <FontPickerRow
              label={t('subheadingFont')}
              font={subheadingFont}
              onChange={(f) => handleFontUpdate('subheading-font', f, setSubheadingFont)}
            />
            <ColorPickerRow
              label={t('subheadingColor')}
              color={subheadingColor}
              onChange={(c) => handleColorUpdate('subheading-color', c, setSubheadingColor)}
            />
          </SidePanel.Section>

          {/* PRODUCT CARDS SECTION */}
          <SidePanel.Section title={t('productCards')}>
            <ColorPickerRow
              label={t('cardBackground')}
              color={cardBgColor}
              onChange={(c) => handleColorUpdate('card-bg-color', c, setCardBgColor)}
            />
            <FontPickerRow
              label={t('productTitleFont')}
              font={productTitleFont}
              onChange={(f) => handleFontUpdate('product-title-font', f, setProductTitleFont)}
            />
            <ColorPickerRow
              label={t('productTitleColor')}
              color={productTitleColor}
              onChange={(c) => handleColorUpdate('product-title-color', c, setProductTitleColor)}
            />
            <FontPickerRow
              label={t('priceFont')}
              font={priceFont}
              onChange={(f) => handleFontUpdate('price-font', f, setPriceFont)}
            />
            <ColorPickerRow
              label={t('priceColor')}
              color={priceColor}
              onChange={(c) => handleColorUpdate('price-color', c, setPriceColor)}
            />
            <FontPickerRow
              label={t('recommendationNoteFont')}
              font={reasonFont}
              onChange={(f) => handleFontUpdate('reason-font', f, setReasonFont)}
            />
            <ColorPickerRow
              label={t('recommendationNoteColor')}
              color={reasonColor}
              onChange={(c) => handleColorUpdate('reason-color', c, setReasonColor)}
            />
            <ColorPickerRow
              label={t('discountBadgeBackground')}
              color={badgeBgColor}
              onChange={(c) => handleColorUpdate('badge-bg-color', c, setBadgeBgColor)}
            />
            <ColorPickerRow
              label={t('discountBadgeTextColor')}
              color={badgeTextColor}
              onChange={(c) => handleColorUpdate('badge-text-color', c, setBadgeTextColor)}
            />
          </SidePanel.Section>

          {/* CTA BUTTON SECTION */}
          <SidePanel.Section title={t('actionButton')}>
            <SidePanel.Field>
              <FormField label={t('buttonLabel')}>
                <Input
                  type="text"
                  value={ctaText}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCtaText(e.target.value);
                    widget.setProp('cta-text', e.target.value);
                  }}
                  aria-label={t('buttonLabel')}
                />
              </FormField>
            </SidePanel.Field>
            <FontPickerRow
              label={t('buttonFont')}
              font={buttonFont}
              onChange={(f) => handleFontUpdate('button-font', f, setButtonFont)}
            />
            <ColorPickerRow
              label={t('buttonBackground')}
              color={buttonColor}
              onChange={(c) => handleColorUpdate('button-color', c, setButtonColor)}
            />
            <ColorPickerRow
              label={t('buttonTextColor')}
              color={buttonTextColor}
              onChange={(c) => handleColorUpdate('button-text-color', c, setButtonTextColor)}
            />
          </SidePanel.Section>

          {/* CONTAINER & GEOMETRY SECTION */}
          <SidePanel.Section title={t('containerLayout')}>
            <ColorPickerRow
              label={t('containerBackground')}
              color={containerBgColor}
              onChange={(c) => handleColorUpdate('container-bg-color', c, setContainerBgColor)}
            />
            <SidePanel.Field>
              <FormField label={t('cornerRadius', { value: borderRadius })}>
                <Slider
                  min={0}
                  max={24}
                  value={borderRadius}
                  onChange={(val: number) => {
                    setBorderRadius(val);
                    widget.setProp('border-radius', val.toString());
                  }}
                />
              </FormField>
            </SidePanel.Field>
          </SidePanel.Section>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
