import { useState, useEffect, type FC } from 'react';
import {
  Page,
  Card,
  Tabs,
  Button,
  Badge,
  Input,
  FormField,
  Box as WdsBox,
  Text,
  Heading,
  Divider,
  Loader,
  ToggleSwitch,
  EmptyState,
  SectionHelper,
  Modal,
  CustomModalLayout,
} from '@wix/design-system';
import { Add, Delete, Check, Refresh } from '@wix/wix-ui-icons-common/lazy';
import { httpClient } from '@wix/essentials';
import { Toaster, toast } from 'sonner';
import { BusinessManagerTheme } from '../../BusinessManagerTheme';
import type { Campaign, AppSettings, BillingStatus, ProductCandidate } from '../../../../lib/types';
import { BillingTab } from './BillingTab';
import { ProductPicker } from './ProductPicker';
import type { DashboardOverviewMetrics } from '../../../../lib/analytics';
import { campaignFormSchema, type CampaignFormValues } from '../../../../lib/validation/campaign';
import { getInitialLocale, localeLabel, setStoredLocale, SUPPORTED_LOCALES, translate, type Locale } from '../../../../lib/i18n';

const Box = WdsBox as any;
const { fetchWithAuth } = httpClient;

const capitalizeFirstCharacter = (value: string) =>
  value.replace(/^(\s*)(\S)/, (_, leading, first) => `${leading}${first.toUpperCase()}`);

export const PostPurchaseDashboard: FC = () => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);
  const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) => translate(locale, key, values);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [overviewMetrics, setOverviewMetrics] = useState<DashboardOverviewMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [pluginPlacement, setPluginPlacement] = useState<{ placedInSlot: boolean } | null>(null);
  const [pluginPlacementLoading, setPluginPlacementLoading] = useState(false);
  const [showPlacementInstructions, setShowPlacementInstructions] = useState(false);

  // New campaign modal form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDiscount, setNewCampaignDiscount] = useState('15');
  const [newCampaignMode, setNewCampaignMode] = useState<CampaignFormValues['mode']>('AI');
  const [newCampaignMinSubtotal, setNewCampaignMinSubtotal] = useState('0');
  const [manualProducts, setManualProducts] = useState<ProductCandidate[]>([]);
  // Full products, not just ids, so selections stay visible when a new search replaces the list.
  const [selectedManualProducts, setSelectedManualProducts] = useState<ProductCandidate[]>([]);
  const [manualProductSearch, setManualProductSearch] = useState('');
  const [manualProductCursor, setManualProductCursor] = useState<string | undefined>();
  const [manualProductHasNext, setManualProductHasNext] = useState(false);
  const [loadingManualProducts, setLoadingManualProducts] = useState(false);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [campaignToToggle, setCampaignToToggle] = useState<Campaign | null>(null);
  const [isTogglingCampaign, setIsTogglingCampaign] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);
  const canUseAiRecommendations = Boolean(billing?.isDevelopment || billing?.plan);

  const resetCampaignForm = () => {
    setNewCampaignName('');
    setNewCampaignDiscount('15');
    setNewCampaignMinSubtotal('0');
    setNewCampaignMode(canUseAiRecommendations ? 'AI' : 'RULES');
    setSelectedManualProducts([]);
    setManualProductSearch('');
    setManualProductCursor(undefined);
    setManualProductHasNext(false);
    setManualProducts([]);
  };

  const closeCampaignModal = () => {
    if (isSavingCampaign) return;
    setShowCreateModal(false);
    setCampaignToEdit(null);
    resetCampaignForm();
  };

  const openCreateCampaign = () => {
    setCampaignToEdit(null);
    resetCampaignForm();
    setShowCreateModal(true);
  };

  const openEditCampaign = async (campaign: Campaign) => {
    setCampaignToEdit(campaign);
    setNewCampaignName(campaign.name);
    setNewCampaignDiscount(String(campaign.discountValue ?? 0));
    setNewCampaignMinSubtotal(String(campaign.minOrderSubtotal ?? 0));
    setNewCampaignMode(
      campaign.recommendationMode === 'AI' && !canUseAiRecommendations
        ? 'RULES'
        : campaign.recommendationMode as CampaignFormValues['mode'],
    );
    setSelectedManualProducts([]);
    if (campaign._id && (campaign.recommendationMode === 'MANUAL' || campaign.recommendationMode === 'HYBRID')) {
      try {
        const response = await fetchWithAuth(`/api/campaigns/${campaign._id}`);
        if (!response.ok) throw new Error('Failed to load campaign products');
        const details = await response.json();
        if (Array.isArray(details?.manualProducts)) {
          setSelectedManualProducts(details.manualProducts as ProductCandidate[]);
        }
      } catch (err) {
        console.error('Failed to load selected campaign products:', err);
        toast.error(t('loadSelectedProductsFailed'));
      }
    }
    setShowCreateModal(true);
  };

  const loadManualProducts = async (search = '', cursor?: string, append = false) => {
    setLoadingManualProducts(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (search.trim()) params.set('q', search.trim());
      if (cursor) params.set('cursor', cursor);
      const response = await fetchWithAuth(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load products');
      const result = await response.json();
      const products = Array.isArray(result?.products) ? result.products : [];
      setManualProducts((previous) => {
        if (!append) return products;
        const merged = new Map(previous.map((product) => [product.productId, product]));
        products.forEach((product: ProductCandidate) => merged.set(product.productId, product));
        return Array.from(merged.values());
      });
      setManualProductCursor(result?.nextCursor || undefined);
      setManualProductHasNext(Boolean(result?.hasNext));
    } catch (err) {
      console.error('Failed to load products for manual campaign:', err);
      toast.error(t('loadStoreProductsFailed'));
    } finally {
      setLoadingManualProducts(false);
    }
  };

  useEffect(() => {
    if (!showCreateModal || (newCampaignMode !== 'MANUAL' && newCampaignMode !== 'HYBRID')) return;
    const timer = window.setTimeout(() => {
      void loadManualProducts(manualProductSearch);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [showCreateModal, newCampaignMode, manualProductSearch]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, campsRes, setRes, billRes, placementRes] = await Promise.all([
        fetchWithAuth('/api/dashboard/overview').then((r) => r.json()),
        fetchWithAuth('/api/campaigns').then((r) => r.json()),
        fetchWithAuth('/api/settings').then((r) => r.json()),
        // Includes the Wix app instance's billing details.
        fetchWithAuth('/api/billing').then((r) => r.json()),
        fetchWithAuth('/api/plugin-placement').then((r) => r.json()),
      ]);
      setOverviewMetrics(metricsRes);
      setCampaigns(Array.isArray(campsRes) ? campsRes : []);
      setSettings(setRes);
      setBilling(billRes);
      if (typeof placementRes?.placedInSlot === 'boolean') {
        setPluginPlacement({ placedInSlot: placementRes.placedInSlot });
      } else {
        setPluginPlacement(null);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshPluginPlacement = async () => {
    setPluginPlacementLoading(true);
    try {
      const response = await fetchWithAuth('/api/plugin-placement');
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Failed to check plugin placement');
      setPluginPlacement({ placedInSlot: result.placedInSlot === true });
      toast.success(result.placedInSlot ? t('pluginPlaced') : t('pluginNotPlaced'));
    } catch (error) {
      console.error('Failed to check plugin placement:', error);
      setPluginPlacement(null);
      toast.error(t('pluginStatusUnknown'));
    } finally {
      setPluginPlacementLoading(false);
    }
  };

  const refreshTab = async (tabId: string) => {
    try {
      if (tabId === 'overview') {
        setOverviewMetrics(await fetchWithAuth('/api/dashboard/overview').then((r) => r.json()));
      } else if (tabId === 'campaigns') {
        const response = await fetchWithAuth('/api/campaigns');
        const data = await response.json();
        setCampaigns(Array.isArray(data) ? data : []);
      } else if (tabId === 'ai' || tabId === 'storefront') {
        setSettings(await fetchWithAuth('/api/settings').then((r) => r.json()));
      } else if (tabId === 'billing') {
        setBilling(await fetchWithAuth('/api/billing').then((r) => r.json()));
      }
    } catch (err) {
      console.error(`Error refreshing ${tabId} tab:`, err);
    }
  };

  // Comes from the plan on Wix billing, not from app settings.
  const aiAllowance = billing && !('error' in billing) ? billing.limits?.monthlyAiRecommendations : undefined;
  const activationNeedsPlan = Boolean(
    campaignToToggle &&
      campaignToToggle.status !== 'active' &&
      billing &&
      !billing.isDevelopment &&
      !billing.plan,
  );

  const openPricing = () => {
    if (billing?.upgradeUrl) {
      window.open(billing.upgradeUrl, '_blank', 'noopener');
      return;
    }
    setCampaignToToggle(null);
    setActiveTab('billing');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    void refreshTab(tabId);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleCampaign = async () => {
    const id = campaignToToggle?._id;
    if (!id) return;

    setIsTogglingCampaign(true);
    try {
      const res = await fetchWithAuth(`/api/campaigns/${id}/activate`, { method: 'POST' });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        if (err.error === 'Choose a plan to activate campaigns.') {
          setCampaignToToggle(null);
          setActiveTab('billing');
        }
        toast.error(err.error || t('updateCampaignFailed'));
        return;
      }

      const action = campaignToToggle.status === 'active' ? 'paused' : 'activated';
      setCampaignToToggle(null);
      toast.success(action === 'paused' ? t('campaignPaused') : t('campaignActivated'));
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle campaign:', err);
      toast.error(t('updateCampaignFailed'));
    } finally {
      setIsTogglingCampaign(false);
    }
  };

  const handleDeleteCampaign = async () => {
    const id = campaignToDelete?._id;
    if (!id) return;

    setIsDeletingCampaign(true);
    try {
      const response = await fetchWithAuth(`/api/campaigns/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error || t('updateCampaignFailed'));
        return;
      }

      setCampaignToDelete(null);
      toast.success(t('campaignDeleted'));
      await fetchData();
    } catch (err) {
      console.error('Failed to delete campaign:', err);
      toast.error(t('updateCampaignFailed'));
    } finally {
      setIsDeletingCampaign(false);
    }
  };

  const handleSaveCampaign = async () => {
    const parsed = campaignFormSchema.safeParse({
      name: newCampaignName,
      discount: newCampaignDiscount,
      minSubtotal: newCampaignMinSubtotal,
      mode: newCampaignMode,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || t('checkCampaignFields'));
      return;
    }

    if (parsed.data.mode === 'AI' && !canUseAiRecommendations) {
      toast.error(t('smartPlanError'));
      return;
    }

    setIsSavingCampaign(true);
    try {
      const isEditing = Boolean(campaignToEdit?._id);
      const res = await fetchWithAuth(
        isEditing ? `/api/campaigns/${campaignToEdit?._id}` : '/api/campaigns',
        {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: parsed.data.name,
          ...(isEditing ? {} : { status: 'active', priority: 5 }),
          minOrderSubtotal: parsed.data.minSubtotal,
          recommendationMode: parsed.data.mode,
          maxOffers: parsed.data.mode === 'MANUAL'
            ? Math.max(selectedManualProducts.length, 1)
            : 4,
          ...((parsed.data.mode === 'MANUAL' || parsed.data.mode === 'HYBRID')
            ? { manualProductIds: selectedManualProducts.map((product) => product.productId) }
            : {}),
          discountType: 'PERCENTAGE',
          discountValue: parsed.data.discount,
          ...(isEditing ? {} : {
            currency: 'USD',
            fallbackMode: 'RULES',
            displayHeading: t('specialOffer'),
            ctaText: t('claimOffer'),
          }),
          displaySubheading: t('saveRecommendedItems', { percent: parsed.data.discount }),
        }),
        },
      );

      if (res.ok) {
        closeCampaignModal();
        toast.success(isEditing ? t('campaignUpdated') : t('campaignActivated'));
        await fetchData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(err.error || (isEditing ? t('failedUpdateCampaign') : t('failedCreateCampaign')));
      }
    } catch (err) {
      console.error('Error saving campaign:', err);
      toast.error(t('saveCampaignFailed'));
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const res = await fetchWithAuth('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  return (
    <BusinessManagerTheme locale={locale}>
      <Page height="100vh">
        <Page.Header
          title={t('appTitle')}
          subtitle={t('increaseAov')}
          actionsBar={
            <Box gap="SP2">
              <select
                aria-label={t('language')}
                value={locale}
                onChange={(event) => {
                  const nextLocale = event.target.value as Locale;
                  setLocale(nextLocale);
                  setStoredLocale(nextLocale);
                }}
                style={{ height: '32px', borderRadius: '4px', padding: '0 8px' }}
              >
                {SUPPORTED_LOCALES.map((option) => (
                  <option key={option} value={option}>{localeLabel(option)}</option>
                ))}
              </select>
              <Button
                skin="standard"
                priority="secondary"
                prefixIcon={<Refresh />}
                onClick={fetchData}
              >
                {t('refresh')}
              </Button>
              <Button
                skin="standard"
                priority="primary"
                prefixIcon={<Add />}
                onClick={openCreateCampaign}
              >
                {t('createCampaign')}
              </Button>
            </Box>
          }
        />

        <Page.Content>
          <Box direction="vertical" gap="SP4">
            <Tabs
              activeId={activeTab}
              onClick={(tab) => handleTabChange(tab.id as string)}
              items={[
                { id: 'overview', title: t('overview') },
                { id: 'campaigns', title: t('campaigns') },
                { id: 'ai', title: t('smartRecommendations') },
                { id: 'storefront', title: t('storefrontPreview') },
                { id: 'billing', title: t('billingPlan') },
              ]}
            />

            {loading ? (
              <Box align="center" justify="center" padding="SP8">
                <Loader />
              </Box>
            ) : null}

            {/* OVERVIEW TAB */}
            {!loading && activeTab === 'overview' && (
              <Box direction="vertical" gap="SP4">
                {/* Metrics Cards */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <Card>
                      <Card.Content>
                        <Text size="small" secondary>
                          {t('attributedRevenue')}
                        </Text>
                        <Heading size="medium">
                          ${overviewMetrics?.totalAttributedRevenue.toFixed(2) || '0.00'}
                        </Heading>
                        <Text size="tiny" skin="success">
                          {t('postPurchaseSales')}
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <Card>
                      <Card.Content>
                        <Text size="small" secondary>
                          {t('offerImpressions')}
                        </Text>
                        <Heading size="medium">
                          {overviewMetrics?.totalImpressions || 0}
                        </Heading>
                        <Text size="tiny" secondary>
                          {t('totalViews')}
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <Card>
                      <Card.Content>
                        <Text size="small" secondary>
                          {t('clickThroughRate')}
                        </Text>
                        <Heading size="medium">
                          {overviewMetrics?.ctr || 0}%
                        </Heading>
                        <Text size="tiny" secondary>
                          {t('totalClicks', { count: overviewMetrics?.totalClicks || 0 })}
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <Card>
                      <Card.Content>
                        <Text size="small" secondary>
                          {t('conversionRate')}
                        </Text>
                        <Heading size="medium">
                          {overviewMetrics?.conversionRate || 0}%
                        </Heading>
                        <Text size="tiny" skin="success">
                          {t('acceptedOffers', { count: overviewMetrics?.totalPurchases || 0 })}
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>
                </div>

                {/* Recommendation Engine Performance & Status Banner */}
                <Card>
                  <Card.Header
                    title={t('pluginPlacement')}
                    subtitle={t('pluginPlacementDescription')}
                    suffix={
                      <Badge skin={pluginPlacement?.placedInSlot ? 'success' : pluginPlacement ? 'warning' : 'neutral'}>
                        {pluginPlacement?.placedInSlot ? t('pluginPlaced') : pluginPlacement ? t('pluginNotPlaced') : t('pluginStatusUnknown')}
                      </Badge>
                    }
                  />
                  <Card.Content>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text size="small" secondary>
                        {pluginPlacement?.placedInSlot
                          ? t('pluginPlaced')
                          : t('pluginPlacementInstructions')}
                      </Text>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                        <Button
                          size="small"
                          skin="standard"
                          priority="secondary"
                          onClick={() => void refreshPluginPlacement()}
                          disabled={pluginPlacementLoading}
                        >
                          {pluginPlacementLoading ? t('loading') : t('checkPlacementStatus')}
                        </Button>
                        {!pluginPlacement?.placedInSlot && (
                          <Button
                            size="small"
                            skin="standard"
                            priority="primary"
                            onClick={() => setShowPlacementInstructions(true)}
                          >
                            {t('addPlugin')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                {/* Recommendation Engine Performance & Status Banner */}
                <Card>
                  <Card.Header
                    title={t('recommendationEngine')}
                    subtitle={t('recommendationSubtitle')}
                    suffix={
                      <Badge skin={settings?.aiEnabled ? 'success' : 'neutral'}>
                        {settings?.aiEnabled ? t('active') : t('paused')}
                      </Badge>
                    }
                  />
                  <Card.Content>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Text weight="bold">{t('acceptanceRate', { value: overviewMetrics?.aiAcceptanceRate || 0 })}</Text>
                        <Text size="small" secondary>
                          {t('recommendationDescription')}
                        </Text>
                      </div>
                      <Button
                        size="small"
                        skin="standard"
                        priority="secondary"
                        onClick={() => setActiveTab('ai')}
                      >
                        {t('configureEngine')}
                      </Button>
                    </div>
                  </Card.Content>
                </Card>

                {/* Campaign Performance Table */}
                <Card>
                  <Card.Header title={t('campaignPerformance')} />
                  <Card.Content>
                    {overviewMetrics?.campaignPerformance && overviewMetrics.campaignPerformance.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px 8px' }}>{t('campaign')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('impressions')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('clicks')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('purchases')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('revenue')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('conversion')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overviewMetrics.campaignPerformance.map((c) => (
                            <tr key={c.campaignId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                                {capitalizeFirstCharacter(c.campaignName)}
                              </td>
                              <td style={{ padding: '12px 8px' }}>{c.impressions}</td>
                              <td style={{ padding: '12px 8px' }}>{c.clicks}</td>
                              <td style={{ padding: '12px 8px' }}>{c.purchases}</td>
                              <td style={{ padding: '12px 8px', fontWeight: 600, color: '#10b981' }}>
                                ${c.revenue.toFixed(2)}
                              </td>
                              <td style={{ padding: '12px 8px' }}>{c.conversionRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <EmptyState
                        title={t('noCampaignActivity')}
                        subtitle={t('testPurchase')}
                      />
                    )}
                  </Card.Content>
                </Card>
              </Box>
            )}

            {/* CAMPAIGNS TAB */}
            {!loading && activeTab === 'campaigns' && (
              <Box direction="vertical" gap="SP4">
                <Card>
                  <Card.Header
                    title={t('activeCampaigns')}
                    subtitle={t('campaignSubtitle')}
                    suffix={
                      <Button
                        size="small"
                        prefixIcon={<Add />}
                        onClick={openCreateCampaign}
                      >
                        {t('newCampaign')}
                      </Button>
                    }
                  />
                  <Card.Content>
                    {campaigns.length === 0 ? (
                      <EmptyState
                        title={t('noCampaigns')}
                        subtitle={t('firstCampaign')}
                      />
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px 8px' }}>{t('campaignName')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('mode')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('discount')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('minimumOrder')}</th>
                            <th style={{ padding: '12px 8px' }}>{t('status')}</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>{t('actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map((camp) => (
                            <tr key={camp._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <Text weight="bold">{capitalizeFirstCharacter(camp.name)}</Text>
                                {camp.description && (
                                  <Text size="tiny" secondary>
                                    {camp.description}
                                  </Text>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <Badge skin="neutral">{camp.recommendationMode}</Badge>
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {camp.discountType === 'PERCENTAGE'
                                  ? `${camp.discountValue}% OFF`
                                  : `$${camp.discountValue} OFF`}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                {camp.minOrderSubtotal ? `$${camp.minOrderSubtotal}` : t('noMinimum')}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <Badge skin={camp.status === 'active' ? 'success' : 'warning'}>
                                  {camp.status.toUpperCase()}
                                </Badge>
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                <Box gap="SP1" justify="right">
                                  <Button
                                    size="tiny"
                                    skin="standard"
                                    priority="secondary"
                                    onClick={() => openEditCampaign(camp)}
                                  >
                                    {t('edit')}
                                  </Button>
                                  <Button
                                    size="tiny"
                                    skin="standard"
                                    priority="secondary"
                                    onClick={() => setCampaignToToggle(camp)}
                                  >
                                    {camp.status === 'active' ? t('pause') : t('activate')}
                                  </Button>
                                  <Button
                                    size="tiny"
                                    skin="destructive"
                                    priority="tertiary"
                                    prefixIcon={<Delete />}
                                    onClick={() => setCampaignToDelete(camp)}
                                  />
                                </Box>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </Card.Content>
                </Card>

                <Modal
                  isOpen={showCreateModal}
                  onRequestClose={closeCampaignModal}
                  shouldCloseOnOverlayClick={!isSavingCampaign}
                  screen="desktop"
                >
                  <CustomModalLayout
                    title={campaignToEdit ? t('editCampaign') : t('createNewCampaign')}
                    subtitle={campaignToEdit ? t('updateParameters') : t('configureParameters')}
                    width="600px"
                    maxHeight="640px"
                    overflowY="auto"
                    showHeaderDivider={false}
                    showFooterDivider={false}
                    closeButtonProps={{ size: 'small', onClick: closeCampaignModal }}
                    primaryButtonText={isSavingCampaign ? t('saving') : campaignToEdit ? t('saveChanges') : t('saveActivate')}
                    primaryButtonProps={{ disabled: isSavingCampaign }}
                    primaryButtonOnClick={handleSaveCampaign}
                    secondaryButtonText={t('cancel')}
                    secondaryButtonProps={{ skin: 'dark', priority: 'secondary', disabled: isSavingCampaign }}
                    secondaryButtonOnClick={closeCampaignModal}
                    content={
                      <Box direction="vertical" gap="SP3">
                        <FormField label={t('campaignName')} required>
                          <Input
                            placeholder={t('productPlaceholder')}
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            aria-label={t('campaignName')}
                          />
                        </FormField>

                        <FormField label={t('recommendationMode')}>
                          <select
                            value={newCampaignMode}
                            onChange={(e) => {
                              const mode = e.target.value as CampaignFormValues['mode'];
                              if (mode === 'AI' && !canUseAiRecommendations) {
                              toast.error(t('smartPlanError'));
                                return;
                              }
                              setNewCampaignMode(mode);
                            }}
                            aria-label={t('recommendationMode')}
                            style={{ width: '100%', height: '36px', borderRadius: '4px', border: '1px solid #c4cdd5', padding: '0 8px' }}
                          >
                            <option value="AI" disabled={!canUseAiRecommendations}>
                              {canUseAiRecommendations ? t('automaticRecommendations') : t('planRequired')}
                            </option>
                            <option value="HYBRID">{t('hybridMode')}</option>
                            <option value="RULES">{t('rulesMode')}</option>
                            <option value="MANUAL">{t('manualMode')}</option>
                          </select>
                        </FormField>

                        {(newCampaignMode === 'MANUAL' || newCampaignMode === 'HYBRID') && (
                          <FormField label={t('merchantProducts')}>
                            <Box direction="vertical" gap="SP2">
                              <ProductPicker
                                products={manualProducts}
                                selected={selectedManualProducts}
                                onChange={setSelectedManualProducts}
                                search={manualProductSearch}
                                onSearchChange={setManualProductSearch}
                                loading={loadingManualProducts}
                                hasNext={manualProductHasNext}
                                onLoadMore={() => void loadManualProducts(manualProductSearch, manualProductCursor, true)}
                                locale={locale}
                              />
                            </Box>
                            <Text size="tiny" secondary>{t('manualDescription')}</Text>
                          </FormField>
                        )}

                        <Box gap="SP3">
                          <Box direction="vertical" style={{ flex: 1 }}>
                            <FormField label={t('discountPercentage')}>
                              <Input
                                type="number"
                                value={newCampaignDiscount}
                                onChange={(e) => setNewCampaignDiscount(e.target.value)}
                                aria-label={t('discountPercentage')}
                              />
                            </FormField>
                          </Box>
                          <Box direction="vertical" style={{ flex: 1 }}>
                            <FormField label={t('minimumSubtotal')}>
                              <Input
                                type="number"
                                value={newCampaignMinSubtotal}
                                onChange={(e) => setNewCampaignMinSubtotal(e.target.value)}
                                aria-label={t('minimumSubtotal')}
                              />
                            </FormField>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </Modal>

                <Modal
                  isOpen={Boolean(campaignToToggle)}
                  onRequestClose={() => !isTogglingCampaign && setCampaignToToggle(null)}
                  shouldCloseOnOverlayClick={!isTogglingCampaign}
                  contentLabel={t('pauseActivateConfirmation', { action: campaignToToggle?.status === 'active' ? t('pause') : t('activate') })}
                  screen="desktop"
                >
                  <CustomModalLayout
                    title={t('pauseActivateQuestion', { action: campaignToToggle?.status === 'active' ? t('pause') : t('activate') })}
                    subtitle={campaignToToggle?.name}
                    primaryButtonText={activationNeedsPlan
                      ? billing?.upgradeUrl
                        ? t('choosePlan')
                        : t('viewBilling')
                      : isTogglingCampaign
                        ? campaignToToggle?.status === 'active'
                          ? t('pausing')
                          : t('activating')
                        : campaignToToggle?.status === 'active'
                          ? t('pauseCampaign')
                          : t('activateCampaign')
                    }
                    primaryButtonProps={{
                      skin: campaignToToggle?.status === 'active' ? 'destructive' : 'standard',
                      disabled: isTogglingCampaign,
                    }}
                    primaryButtonOnClick={() => {
                      if (activationNeedsPlan) {
                        openPricing();
                        return;
                      }
                      void handleToggleCampaign();
                    }}
                    secondaryButtonText={t('cancel')}
                    secondaryButtonProps={{ disabled: isTogglingCampaign }}
                    secondaryButtonOnClick={() => setCampaignToToggle(null)}
                    closeButtonProps={{
                      size: 'small',
                      onClick: () => !isTogglingCampaign && setCampaignToToggle(null),
                    }}
                  >
                    <Text>
                      {activationNeedsPlan
                        ? t('choosePlanToActivate')
                        : campaignToToggle?.status === 'active'
                        ? t('pausedCampaignDescription')
                        : t('activatedCampaignDescription')}
                    </Text>
                  </CustomModalLayout>
                </Modal>

                <Modal
                  isOpen={Boolean(campaignToDelete)}
                  onRequestClose={() => !isDeletingCampaign && setCampaignToDelete(null)}
                  shouldCloseOnOverlayClick={!isDeletingCampaign}
                  contentLabel={t('deleteCampaignQuestion')}
                  screen="desktop"
                >
                  <CustomModalLayout
                    skin="destructive"
                    title={t('deleteCampaignQuestion')}
                    subtitle={t('permanentlyDelete', { name: campaignToDelete?.name || t('campaign') })}
                    primaryButtonText={isDeletingCampaign ? t('deleting') : t('deleteCampaign')}
                    primaryButtonProps={{
                      skin: 'destructive',
                      disabled: isDeletingCampaign,
                    }}
                    primaryButtonOnClick={() => void handleDeleteCampaign()}
                    secondaryButtonText={t('cancel')}
                    secondaryButtonProps={{ disabled: isDeletingCampaign }}
                    secondaryButtonOnClick={() => setCampaignToDelete(null)}
                    closeButtonProps={{
                      size: 'small',
                      onClick: () => !isDeletingCampaign && setCampaignToDelete(null),
                    }}
                  >
                    <Text>
                      Any offers associated with this campaign will no longer be shown on your Thank You page.
                    </Text>
                  </CustomModalLayout>
                </Modal>

              </Box>
            )}

            <Modal
              isOpen={showPlacementInstructions}
              onRequestClose={() => setShowPlacementInstructions(false)}
              contentLabel={t('placementInstructionsTitle')}
              screen="desktop"
            >
              <CustomModalLayout
                title={t('placementInstructionsTitle')}
                primaryButtonText={t('checkPlacementStatus')}
                primaryButtonOnClick={() => {
                  setShowPlacementInstructions(false);
                  void refreshPluginPlacement();
                }}
                secondaryButtonText={t('cancel')}
                secondaryButtonOnClick={() => setShowPlacementInstructions(false)}
                closeButtonProps={{
                  size: 'small',
                  onClick: () => setShowPlacementInstructions(false),
                }}
              >
                <Text>{t('pluginPlacementInstructions')}</Text>
              </CustomModalLayout>
            </Modal>

            {/* RECOMMENDATIONS TAB */}
            {!loading && activeTab === 'ai' && (
              <Box direction="vertical" gap="SP4">
                <Card>
                  <Card.Header
                    title={t('recommendationConfiguration')}
                    subtitle={t('recommendationConfigurationSubtitle')}
                    suffix={
                      <ToggleSwitch
                        checked={settings?.aiEnabled || false}
                        onChange={(e) => handleUpdateSettings({ aiEnabled: e.target.checked })}
                      />
                    }
                  />
                  <Card.Content>
                    <Box direction="vertical" gap="SP3">
                      <Box gap="SP3">
                        <Box style={{ flex: 1 }} direction="vertical" gap="SP1">
                          <Text weight="bold">{t('recommendationService')}</Text>
                          <Text size="small" secondary>{t('catalogueScoring')}</Text>
                          <Text size="small" secondary>{t('secureProcessing')}</Text>
                        </Box>
                        <Box style={{ flex: 1 }} direction="vertical" gap="SP1">
                          <Text weight="bold">{t('privacySecurity')}</Text>
                          <Text size="small" secondary>
                            Recommendation requests run completely server-side. No customer data or payment details are exposed.
                          </Text>
                        </Box>
                      </Box>

                      <Divider />

                      <Box gap="SP3" align="center">
                        <Box direction="vertical" style={{ flex: 1 }}>
                          <Text weight="bold">{t('showRecommendationReasons')}</Text>
                          <Text size="small" secondary>
                            {t('recommendationReasonsDescription')}
                          </Text>
                        </Box>
                        <ToggleSwitch
                          checked={settings?.enableAiExplanations || false}
                          onChange={(e) => handleUpdateSettings({ enableAiExplanations: e.target.checked })}
                        />
                      </Box>

                      <Divider />

                      <Box direction="vertical" gap="SP1">
                        <Text weight="bold">{t('costUsageProtection')}</Text>
                        <Text size="small" secondary>
                          {t('monthlyRequests', { used: settings?.monthlyAiUsage || 0, limit: aiAllowance ?? 'no plan' })}
                        </Text>
                        <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${aiAllowance ? Math.min(100, ((settings?.monthlyAiUsage || 0) / aiAllowance) * 100) : 0}%`,
                              height: '100%',
                              background: '#116dff',
                            }}
                          />
                        </div>
                      </Box>
                    </Box>
                  </Card.Content>
                </Card>
              </Box>
            )}

            {/* STOREFRONT PREVIEW TAB */}
            {!loading && activeTab === 'storefront' && (
              <Box direction="vertical" gap="SP4">
                <SectionHelper
                  fullWidth
                  skin="standard"
                  title={t('editorAppearance')}
                >
                  {t('editorAppearanceDescription')}
                </SectionHelper>

                {/* LIVE STOREFRONT PREVIEW */}
                <Card>
                  <Card.Header
                    title={t('livePreview')}
                    subtitle={t('livePreviewSubtitle')}
                  />
                  <Card.Content>
                    <div style={{ background: '#f3f4f6', padding: '24px', borderRadius: '8px' }}>
                      <div
                        style={{
                          background: '#ffffff',
                          borderRadius: `${settings?.borderRadius || 8}px`,
                          border: '1px solid #e5e7eb',
                          padding: '24px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                              {settings?.headline || t('previewHeading')}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                              {settings?.subheadline || t('previewSubheading')}
                            </p>
                          </div>
                          <button style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '12px', textDecoration: 'underline' }}>
                            No thanks, dismiss
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                          <div style={{ border: '1px solid #e5e7eb', borderRadius: `${settings?.borderRadius || 8}px`, padding: '16px', position: 'relative' }}>
                            <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ebf5ff', color: '#116dff', fontSize: '10px', fontWeight: 700, padding: '3px 6px', borderRadius: '4px' }}>
                              SAVE 15%
                            </span>
                            <div style={{ height: '120px', background: '#f9fafb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '32px' }}>⚡️</span>
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{t('previewProduct')}</div>
                            <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '12px' }}>{t('previewReason')}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
                              <span style={{ fontSize: '16px', fontWeight: 700 }}>$21.25</span>
                              <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>$25.00</span>
                            </div>
                            <button
                              style={{
                                width: '100%',
                                background: settings?.buttonColor || '#116dff',
                                color: settings?.buttonTextColor || '#ffffff',
                                border: 'none',
                                borderRadius: `${Math.max(4, (settings?.borderRadius || 8) - 2)}px`,
                                padding: '8px 12px',
                                fontSize: '13px',
                                fontWeight: 600,
                              }}
                            >
                              Add to Order →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </Box>
            )}

            {/* BILLING & PLAN TAB */}
            {!loading && activeTab === 'billing' && <BillingTab billing={billing} locale={locale} />}
          </Box>
        </Page.Content>
        </Page>
        <Toaster position="top-right" richColors closeButton />
    </BusinessManagerTheme>
  );
};

export default PostPurchaseDashboard;
