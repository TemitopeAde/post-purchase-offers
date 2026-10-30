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
} from '@wix/design-system';
import { Add, Delete, Check, Refresh } from '@wix/wix-ui-icons-common/lazy';
import { httpClient } from '@wix/essentials';
import { BusinessManagerTheme } from '../../BusinessManagerTheme';
import type { Campaign, AppSettings } from '../../../../lib/types';
import type { DashboardOverviewMetrics } from '../../../../lib/analytics';

const Box = WdsBox as any;
const { fetchWithAuth } = httpClient;

export const PostPurchaseDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [overviewMetrics, setOverviewMetrics] = useState<DashboardOverviewMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [billing, setBilling] = useState<any>(null);

  // New campaign modal form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDiscount, setNewCampaignDiscount] = useState('15');
  const [newCampaignMode, setNewCampaignMode] = useState<any>('AI');
  const [newCampaignMinSubtotal, setNewCampaignMinSubtotal] = useState('0');
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, campsRes, setRes, billRes] = await Promise.all([
        fetchWithAuth('/api/dashboard/overview').then((r) => r.json()),
        fetchWithAuth('/api/campaigns').then((r) => r.json()),
        fetchWithAuth('/api/settings').then((r) => r.json()),
        fetchWithAuth('/api/billing').then((r) => r.json()),
      ]);
      setOverviewMetrics(metricsRes);
      setCampaigns(Array.isArray(campsRes) ? campsRes : []);
      setSettings(setRes);
      setBilling(billRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleCampaign = async (id?: string) => {
    if (!id) return;
    try {
      await fetchWithAuth(`/api/campaigns/${id}/activate`, { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle campaign:', err);
    }
  };

  const handleDeleteCampaign = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await fetchWithAuth(`/api/campaigns/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    setIsSavingCampaign(true);
    try {
      const res = await fetchWithAuth('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaignName.trim(),
          status: 'active',
          priority: 5,
          minOrderSubtotal: parseFloat(newCampaignMinSubtotal) || 0,
          currency: 'USD',
          recommendationMode: newCampaignMode,
          maxOffers: 2,
          fallbackMode: 'RULES',
          discountType: 'PERCENTAGE',
          discountValue: parseFloat(newCampaignDiscount) || 15,
          displayHeading: 'Special add-on offer for your order',
          displaySubheading: `Save ${newCampaignDiscount}% on these recommended items!`,
          ctaText: 'Claim Offer',
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewCampaignName('');
        await fetchData();
      } else {
        const err = await res.json();
        alert(err?.error || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
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
    <BusinessManagerTheme>
      <Page height="100vh">
        <Page.Header
          title="Smart Post-Purchase Offers"
          subtitle="Increase Average Order Value (AOV) with smart upsell recommendations on the Thank You page."
          actionsBar={
            <Box gap="SP2">
              <Button
                skin="standard"
                priority="secondary"
                prefixIcon={<Refresh />}
                onClick={fetchData}
              >
                Refresh
              </Button>
              <Button
                skin="standard"
                priority="primary"
                prefixIcon={<Add />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Campaign
              </Button>
            </Box>
          }
        />

        <Page.Content>
          <Box direction="vertical" gap="SP4">
            <Tabs
              activeId={activeTab}
              onClick={(tab) => setActiveTab(tab.id as string)}
              items={[
                { id: 'overview', title: 'Overview' },
                { id: 'campaigns', title: 'Campaigns' },
                { id: 'ai', title: 'Smart Recommendations' },
                { id: 'storefront', title: 'Storefront Preview' },
                { id: 'billing', title: 'Billing & Plan' },
              ]}
            />

            {loading ? (
              <Box align="center" justify="center" padding="SP8">
                <Loader text="Loading your store's post-purchase data..." />
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
                          Attributed Additional Revenue
                        </Text>
                        <Heading size="medium">
                          ${overviewMetrics?.totalAttributedRevenue.toFixed(2) || '0.00'}
                        </Heading>
                        <Text size="tiny" skin="success">
                          +100% post-purchase sales
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <Card>
                      <Card.Content>
                        <Text size="small" secondary>
                          Offer Impressions
                        </Text>
                        <Heading size="medium">
                          {overviewMetrics?.totalImpressions || 0}
                        </Heading>
                        <Text size="tiny" secondary>
                          Total views on Thank You page
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <Card>
                      <Card.Content>
                        <Text size="small" secondary>
                          Click-Through Rate (CTR)
                        </Text>
                        <Heading size="medium">
                          {overviewMetrics?.ctr || 0}%
                        </Heading>
                        <Text size="tiny" secondary>
                          {overviewMetrics?.totalClicks || 0} total clicks
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <Card>
                      <Card.Content>
                        <Text size="small" secondary>
                          Offer Conversion Rate
                        </Text>
                        <Heading size="medium">
                          {overviewMetrics?.conversionRate || 0}%
                        </Heading>
                        <Text size="tiny" skin="success">
                          {overviewMetrics?.totalPurchases || 0} accepted offers paid
                        </Text>
                      </Card.Content>
                    </Card>
                  </div>
                </div>

                {/* Recommendation Engine Performance & Status Banner */}
                <Card>
                  <Card.Header
                    title="Smart Recommendation Engine"
                    subtitle="Hybrid recommendation pipeline with automated candidate validation"
                    suffix={
                      <Badge skin={settings?.aiEnabled ? 'success' : 'neutral'}>
                        {settings?.aiEnabled ? 'Active' : 'Paused'}
                      </Badge>
                    }
                  />
                  <Card.Content>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Text weight="bold">Offer Acceptance Rate: {overviewMetrics?.aiAcceptanceRate || 0}%</Text>
                        <Text size="small" secondary>
                          Intelligently ranks candidate products from your Wix Stores catalogue in real time, validating price, stock, and complementary relevance without modifying original orders.
                        </Text>
                      </div>
                      <Button
                        size="small"
                        skin="standard"
                        priority="secondary"
                        onClick={() => setActiveTab('ai')}
                      >
                        Configure Engine
                      </Button>
                    </div>
                  </Card.Content>
                </Card>

                {/* Campaign Performance Table */}
                <Card>
                  <Card.Header title="Campaign Performance" />
                  <Card.Content>
                    {overviewMetrics?.campaignPerformance && overviewMetrics.campaignPerformance.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px 8px' }}>Campaign</th>
                            <th style={{ padding: '12px 8px' }}>Impressions</th>
                            <th style={{ padding: '12px 8px' }}>Clicks</th>
                            <th style={{ padding: '12px 8px' }}>Purchases</th>
                            <th style={{ padding: '12px 8px' }}>Revenue</th>
                            <th style={{ padding: '12px 8px' }}>Conversion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overviewMetrics.campaignPerformance.map((c) => (
                            <tr key={c.campaignId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.campaignName}</td>
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
                        title="No campaign activity yet"
                        subtitle="Complete a test purchase in your store to see real-time impression and conversion data."
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
                    title="Active Upsell & Cross-Sell Campaigns"
                    subtitle="Target offers by order subtotal, purchased items, or AI recommendations"
                    suffix={
                      <Button
                        size="small"
                        prefixIcon={<Add />}
                        onClick={() => setShowCreateModal(true)}
                      >
                        New Campaign
                      </Button>
                    }
                  />
                  <Card.Content>
                    {campaigns.length === 0 ? (
                      <EmptyState
                        title="No campaigns found"
                        subtitle="Create your first campaign to start recommending complementary products."
                      />
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px 8px' }}>Campaign Name</th>
                            <th style={{ padding: '12px 8px' }}>Mode</th>
                            <th style={{ padding: '12px 8px' }}>Discount</th>
                            <th style={{ padding: '12px 8px' }}>Min Order</th>
                            <th style={{ padding: '12px 8px' }}>Status</th>
                            <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map((camp) => (
                            <tr key={camp._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '12px 8px' }}>
                                <Text weight="bold">{camp.name}</Text>
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
                                {camp.minOrderSubtotal ? `$${camp.minOrderSubtotal}` : 'No minimum'}
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
                                    onClick={() => handleToggleCampaign(camp._id)}
                                  >
                                    {camp.status === 'active' ? 'Pause' : 'Activate'}
                                  </Button>
                                  <Button
                                    size="tiny"
                                    skin="destructive"
                                    priority="tertiary"
                                    prefixIcon={<Delete />}
                                    onClick={() => handleDeleteCampaign(camp._id)}
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

                {/* CREATE CAMPAIGN CARD (MODAL INLINE) */}
                {showCreateModal && (
                  <Card>
                    <Card.Header
                      title="Create New Post-Purchase Campaign"
                      subtitle="Configure targeting and discount parameters"
                    />
                    <Card.Content>
                      <Box direction="vertical" gap="SP3">
                        <FormField label="Campaign Name" required>
                          <Input
                            placeholder="e.g. Phone Accessories Upsell"
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                          />
                        </FormField>

                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <FormField label="Recommendation Mode">
                              <select
                                value={newCampaignMode}
                                onChange={(e) => setNewCampaignMode(e.target.value)}
                                style={{ width: '100%', height: '36px', borderRadius: '4px', border: '1px solid #c4cdd5', padding: '0 8px' }}
                              >
                                <option value="AI">Automatic Smart Recommendations</option>
                                <option value="HYBRID">Hybrid (Merchant + Smart Rules)</option>
                                <option value="RULES">Deterministic Rules (Category & Price)</option>
                                <option value="MANUAL">Manual Products Only</option>
                              </select>
                            </FormField>
                          </div>

                          <div style={{ flex: 1 }}>
                            <FormField label="Discount Percentage (%)">
                              <Input
                                type="number"
                                value={newCampaignDiscount}
                                onChange={(e) => setNewCampaignDiscount(e.target.value)}
                              />
                            </FormField>
                          </div>

                          <div style={{ flex: 1 }}>
                            <FormField label="Minimum Order Subtotal ($)">
                              <Input
                                type="number"
                                value={newCampaignMinSubtotal}
                                onChange={(e) => setNewCampaignMinSubtotal(e.target.value)}
                              />
                            </FormField>
                          </div>
                        </div>

                        <Box gap="SP2" justify="right" style={{ marginTop: '12px' }}>
                          <Button
                            skin="standard"
                            priority="secondary"
                            onClick={() => setShowCreateModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            skin="standard"
                            priority="primary"
                            disabled={isSavingCampaign}
                            onClick={handleCreateCampaign}
                          >
                            {isSavingCampaign ? 'Creating...' : 'Save & Activate'}
                          </Button>
                        </Box>
                      </Box>
                    </Card.Content>
                  </Card>
                )}
              </Box>
            )}

            {/* RECOMMENDATIONS TAB */}
            {!loading && activeTab === 'ai' && (
              <Box direction="vertical" gap="SP4">
                <Card>
                  <Card.Header
                    title="Recommendation Engine Configuration"
                    subtitle="Controls real-time smart ranking over your bounded catalogue"
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
                          <Text weight="bold">Engine: Smart Recommendation Service</Text>
                          <Text size="small" secondary>Real-time catalogue scoring & ranking</Text>
                          <Text size="small" secondary>Secure server-side processing</Text>
                        </Box>
                        <Box style={{ flex: 1 }} direction="vertical" gap="SP1">
                          <Text weight="bold">Data Privacy & Security</Text>
                          <Text size="small" secondary>
                            Recommendation requests run completely server-side. No customer data or payment details are exposed.
                          </Text>
                        </Box>
                      </Box>

                      <Divider />

                      <Box gap="SP3" align="center">
                        <Box direction="vertical" style={{ flex: 1 }}>
                          <Text weight="bold">Show Recommendation Reasons to Customers</Text>
                          <Text size="small" secondary>
                            Display concise explanations on the storefront (e.g. &quot;A protective case helps keep your new phone safe.&quot;)
                          </Text>
                        </Box>
                        <ToggleSwitch
                          checked={settings?.enableAiExplanations || false}
                          onChange={(e) => handleUpdateSettings({ enableAiExplanations: e.target.checked })}
                        />
                      </Box>

                      <Divider />

                      <Box direction="vertical" gap="SP1">
                        <Text weight="bold">Cost & Usage Protection</Text>
                        <Text size="small" secondary>
                          Monthly requests: {settings?.monthlyAiUsage || 0} / {settings?.monthlyAiAllowance || 500}
                        </Text>
                        <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, ((settings?.monthlyAiUsage || 0) / (settings?.monthlyAiAllowance || 500)) * 100)}%`,
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
                  title="Appearance Managed in Wix Editor / Studio"
                >
                  Typography (fonts) and colors for each element (headings, subheadings, cards, product titles, prices, and CTA buttons) are customized directly in the Wix Studio / Editor canvas via the widget&apos;s Settings Panel.
                </SectionHelper>

                {/* LIVE STOREFRONT PREVIEW */}
                <Card>
                  <Card.Header
                    title="Live Preview on Thank You Page"
                    subtitle="This is how offers appear to customers after completing checkout"
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
                              {settings?.headline || 'A little something extra for you'}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                              {settings?.subheadline || 'Complementary picks tailored to your order.'}
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
                            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>High-Speed Fast Charger & Cable</div>
                            <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '12px' }}>✦ Ideal charging accessory for your new device.</div>
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
            {!loading && activeTab === 'billing' && (
              <Box direction="vertical" gap="SP4">
                <Card>
                  <Card.Header
                    title="Subscription & Entitlements"
                    subtitle="Wix App Market billing status"
                    suffix={<Badge skin="success">{billing?.plan || 'Pro'}</Badge>}
                  />
                  <Card.Content>
                    <Box direction="vertical" gap="SP3">
                      <Box gap="SP4">
                        <Box style={{ flex: 1 }}>
                          <Text weight="bold">Current Plan</Text>
                          <Heading size="small">{billing?.plan || 'Pro'}</Heading>
                          <Text size="small" secondary>Full access to smart recommendations and unlimited campaigns</Text>
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Text weight="bold">Monthly Requests</Text>
                          <Heading size="small">{billing?.monthlyUsage || 12} / {billing?.monthlyAllowance || 500}</Heading>
                          <Text size="small" secondary>Resets on the 1st of every month</Text>
                        </Box>
                      </Box>
                      <Divider />
                      <Box gap="SP2" align="center">
                        <Check />
                        <Text size="small">Smart ranking engine activated</Text>
                      </Box>
                      <Box gap="SP2" align="center">
                        <Check />
                        <Text size="small">Automatic Wix Cart V2 & Checkout creation</Text>
                      </Box>
                      <Box gap="SP2" align="center">
                        <Check />
                        <Text size="small">Stores Catalog V1 & V3 dual compatibility</Text>
                      </Box>
                    </Box>
                  </Card.Content>
                </Card>
              </Box>
            )}
          </Box>
        </Page.Content>
      </Page>
    </BusinessManagerTheme>
  );
};

export default PostPurchaseDashboard;
