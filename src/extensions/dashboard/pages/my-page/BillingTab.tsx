import type { FC, ReactNode } from 'react';
import {
  Badge,
  Box as WdsBox,
  Button,
  Card,
  Cell,
  Divider,
  EmptyState,
  Heading,
  Layout,
  LinearProgressBar,
  SectionHelper,
  Text,
} from '@wix/design-system';
import { Check, ExternalLink, LockLocked, Premium } from '@wix/wix-ui-icons-common/lazy';
import type { BillingStatus } from '../../../../lib/types';

// Same workaround as my-page.tsx: WDS Box's typings clash with this project's React types.
const Box = WdsBox as any;

const CYCLE_LABELS: Record<string, string> = {
  MONTHLY: 'Billed monthly',
  YEARLY: 'Billed yearly',
  TWO_YEARS: 'Billed every 2 years',
  THREE_YEARS: 'Billed every 3 years',
  FOUR_YEARS: 'Billed every 4 years',
  FIVE_YEARS: 'Billed every 5 years',
  ONE_TIME: 'One-time purchase',
};

const FEATURES: { key: keyof BillingStatus['entitlements']; title: string; description: string }[] = [
  { key: 'smartRanking', title: 'Smart product recommendations', description: 'Ranks your catalog against every completed order.' },
  { key: 'unlimitedCampaigns', title: 'Unlimited campaigns', description: 'Run as many upsell and cross-sell campaigns as you need.' },
  { key: 'advancedTargeting', title: 'Advanced targeting', description: 'Target offers by purchased products, collections and order value.' },
  { key: 'analyticsExport', title: 'Analytics export', description: 'Download campaign performance for your own reporting.' },
];

const USAGE_WARNING_PERCENT = 80;

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : undefined;

function planBadge(billing: BillingStatus): ReactNode {
  if (billing.freeTrial?.status === 'IN_PROGRESS') return <Badge skin="premium">Free trial</Badge>;
  if (billing.isFree) return <Badge skin="neutralLight">Free</Badge>;
  if (billing.autoRenewing === false) return <Badge skin="warning">Not renewing</Badge>;
  return <Badge skin="success">Active</Badge>;
}

function renewalText(billing: BillingStatus): string {
  if (billing.isFree) return 'Upgrade to unlock unlimited campaigns, advanced targeting and analytics export.';
  const date = formatDate(billing.expirationDate);
  if (!date) return 'Your plan is active.';
  return billing.autoRenewing === false ? `Your plan ends on ${date}. Renewal is turned off.` : `Renews on ${date}.`;
}

export const BillingTab: FC<{ billing: BillingStatus | null }> = ({ billing }) => {
  if (!billing || 'error' in billing) {
    return (
      <Card>
        <Card.Content>
          <EmptyState
            title="Billing details aren't available"
            subtitle="We couldn't load your plan right now. Refresh the page to try again."
          />
        </Card.Content>
      </Card>
    );
  }

  const openPricing = () => billing.upgradeUrl && window.open(billing.upgradeUrl, '_blank', 'noopener');
  const usagePercent = billing.monthlyAllowance
    ? Math.min(100, Math.round((billing.monthlyUsage / billing.monthlyAllowance) * 100))
    : 0;
  const nearLimit = usagePercent >= USAGE_WARNING_PERCENT;
  const trialEnds = billing.freeTrial?.status === 'IN_PROGRESS' ? formatDate(billing.freeTrial.endDate) : undefined;

  return (
    <Box direction="vertical" gap="SP4">
      {!billing.fromWixBilling && (
        <SectionHelper skin="warning" title="Showing your saved plan">
          We couldn't reach Wix billing, so plan details may be out of date.
        </SectionHelper>
      )}

      {trialEnds && (
        <SectionHelper
          skin="premium"
          title={`Your free trial ends on ${trialEnds}`}
          actionText={billing.upgradeUrl ? 'Choose a plan' : undefined}
          onAction={billing.upgradeUrl ? openPricing : undefined}
        >
          Pick a plan before then to keep your offers running without interruption.
        </SectionHelper>
      )}

      <Layout>
        <Cell span={7}>
          <Card stretchVertically>
            <Card.Header title="Your plan" subtitle="Billed through Wix" suffix={planBadge(billing)} />
            <Card.Divider />
            <Card.Content>
              <Box direction="vertical" gap="SP4">
                <Box direction="vertical" gap="SP1">
                  <Heading size="large">{billing.plan}</Heading>
                  {billing.billingCycle && CYCLE_LABELS[billing.billingCycle] && (
                    <Text size="small" secondary>{CYCLE_LABELS[billing.billingCycle]}</Text>
                  )}
                </Box>
                <Text>{renewalText(billing)}</Text>
                <Box>
                  {billing.isFree ? (
                    <Button skin="premium" prefixIcon={<Premium />} disabled={!billing.upgradeUrl} onClick={openPricing}>
                      Upgrade
                    </Button>
                  ) : (
                    <Button priority="secondary" suffixIcon={<ExternalLink />} disabled={!billing.upgradeUrl} onClick={openPricing}>
                      Manage plan
                    </Button>
                  )}
                </Box>
              </Box>
            </Card.Content>
          </Card>
        </Cell>

        <Cell span={5}>
          <Card stretchVertically>
            <Card.Header title="Recommendation requests" subtitle="Used this month" />
            <Card.Divider />
            <Card.Content>
              <Box direction="vertical" gap="SP3">
                <Heading size="large">
                  {billing.monthlyUsage.toLocaleString()} of {billing.monthlyAllowance.toLocaleString()}
                </Heading>
                <LinearProgressBar
                  value={usagePercent}
                  showProgressIndication
                  skin={nearLimit ? 'warning' : 'standard'}
                  aria-label="Monthly recommendation requests used"
                />
                {nearLimit && (
                  <Text size="small" secondary>
                    You've used {usagePercent}% of this month's requests.
                  </Text>
                )}
              </Box>
            </Card.Content>
          </Card>
        </Cell>
      </Layout>

      <Card>
        <Card.Header title="What's included" subtitle={billing.isFree ? 'Features on your plan, and what upgrading unlocks' : 'Everything on your plan'} />
        <Card.Divider />
        <Card.Content>
          <Box direction="vertical" gap="SP3">
            {FEATURES.map((feature, index) => {
              const included = billing.entitlements[feature.key];
              return (
                <Box key={feature.key} direction="vertical" gap="SP3">
                  {index > 0 && <Divider />}
                  <Box gap="SP3" verticalAlign="middle">
                    <Text skin={included ? 'success' : 'disabled'}>{included ? <Check /> : <LockLocked />}</Text>
                    <Box direction="vertical" flexGrow={1}>
                      <Text weight="bold" skin={included ? 'standard' : 'disabled'}>{feature.title}</Text>
                      <Text size="small" secondary>{feature.description}</Text>
                    </Box>
                    {!included && <Badge skin="premium" size="small">Premium</Badge>}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card.Content>
      </Card>
    </Box>
  );
};
