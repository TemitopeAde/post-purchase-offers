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
import { PLANS, type PlanDefinition, type PlanId } from '../../../../lib/billing/plans';

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

const PLAN_ORDER: PlanId[] = ['Pro', 'Business'];

const PLAN_TAGLINES: Record<PlanId, string> = {
  Pro: 'For growing stores running a few upsell campaigns.',
  Business: 'For high-volume stores that test and report on every offer.',
};

// Each row renders a value per plan: a string, or a boolean shown as a check or a lock.
const COMPARISON: { title: string; value: (plan: PlanDefinition) => string | boolean }[] = [
  { title: 'Active campaigns', value: (p) => p.limits.maxActiveCampaigns?.toLocaleString() ?? 'Unlimited' },
  { title: 'AI recommendations / month', value: (p) => p.limits.monthlyAiRecommendations.toLocaleString() },
  { title: 'Smart product ranking', value: () => true },
  { title: 'Targeting by product, collection and order value', value: (p) => p.limits.advancedTargeting },
  { title: 'Stacked targeting rules (AND/OR)', value: (p) => p.limits.stackedRules },
  { title: 'AI explanations on offers', value: (p) => p.limits.aiExplanations },
  { title: 'Analytics history', value: (p) => (p.limits.analyticsDays ? `${p.limits.analyticsDays} days` : 'All history') },
  { title: 'Support', value: (p) => (p.limits.prioritySupport ? 'Priority' : 'Email') },
];

const USAGE_WARNING_PERCENT = 80;

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : undefined;

const formatPrice = (amount: number) => `$${amount % 1 === 0 ? amount : amount.toFixed(2)}`;

const percentOf = (used: number, limit: number) => (limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0);

function planBadge(billing: BillingStatus): ReactNode {
  if (billing.isDevelopment) return <Badge skin="premium">Development</Badge>;
  if (!billing.plan) return <Badge skin="danger">No plan</Badge>;
  if (billing.freeTrial?.status === 'IN_PROGRESS') return <Badge skin="premium">Free trial</Badge>;
  if (billing.autoRenewing === false) return <Badge skin="warning">Not renewing</Badge>;
  return <Badge skin="success">Active</Badge>;
}

function renewalText(billing: BillingStatus): string {
  if (billing.isDevelopment) return 'All plan features are enabled for development testing.';
  const date = formatDate(billing.expirationDate);
  if (!date) return 'Your plan is active.';
  return billing.autoRenewing === false ? `Your plan ends on ${date}. Renewal is turned off.` : `Renews on ${date}.`;
}

const ComparisonValue: FC<{ value: string | boolean }> = ({ value }) =>
  typeof value === 'string' ? (
    <Text size="small">{value}</Text>
  ) : (
    <Text skin={value ? 'success' : 'disabled'}>{value ? <Check /> : <LockLocked />}</Text>
  );

const UsageMeter: FC<{ label: string; used: number; limit: number | null; unit: string }> = ({ label, used, limit, unit }) => {
  if (limit === null) {
    return (
      <Box direction="vertical" gap="SP1">
        <Text weight="bold">{label}</Text>
        <Text size="small" secondary>{used.toLocaleString()} {unit} · Unlimited</Text>
      </Box>
    );
  }
  const percent = percentOf(used, limit);
  return (
    <Box direction="vertical" gap="SP2">
      <Text weight="bold">{label}</Text>
      <Text size="small" secondary>{used.toLocaleString()} of {limit.toLocaleString()} {unit}</Text>
      <LinearProgressBar
        value={percent}
        showProgressIndication
        skin={percent >= USAGE_WARNING_PERCENT ? 'warning' : 'standard'}
        aria-label={`${label} used`}
      />
    </Box>
  );
};

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
  const current = billing.plan ? PLANS[billing.plan] : billing.isDevelopment ? PLANS.Business : null;
  const trialEnds = billing.freeTrial?.status === 'IN_PROGRESS' ? formatDate(billing.freeTrial.endDate) : undefined;
  const aiPercent = billing.limits ? percentOf(billing.monthlyUsage, billing.limits.monthlyAiRecommendations) : 0;

  return (
    <Box direction="vertical" gap="SP4">
      {!billing.fromWixBilling && (
        <SectionHelper skin="warning" title="Showing your saved plan">
          We couldn't reach Wix billing, so plan details may be out of date.
        </SectionHelper>
      )}

      {billing.isDevelopment && (
        <SectionHelper skin="premium" title="Development mode">
          Plan restrictions are bypassed for development testing. Production will enforce Wix plan limits.
        </SectionHelper>
      )}

      {!current && (
        <SectionHelper
          skin="danger"
          title="Your offers are turned off"
          actionText={billing.upgradeUrl ? 'Choose a plan' : undefined}
          onAction={billing.upgradeUrl ? openPricing : undefined}
        >
          Choose Pro or Business to show post-purchase offers to your customers. Both start with a{' '}
          {PLANS.Pro.trialDays}-day free trial.
        </SectionHelper>
      )}

      {trialEnds && (
        <SectionHelper
          skin="premium"
          title={`Your free trial ends on ${trialEnds}`}
          actionText={billing.upgradeUrl ? 'Manage plan' : undefined}
          onAction={billing.upgradeUrl ? openPricing : undefined}
        >
          Your plan starts automatically when the trial ends, so your offers keep running.
        </SectionHelper>
      )}

      {current && billing.limits && aiPercent >= USAGE_WARNING_PERCENT && (
        <SectionHelper
          skin="warning"
          title={`You've used ${aiPercent}% of this month's AI recommendations`}
          actionText={billing.plan === 'Pro' && billing.upgradeUrl ? 'Upgrade to Business' : undefined}
          onAction={billing.plan === 'Pro' && billing.upgradeUrl ? openPricing : undefined}
        >
          When the allowance runs out, offers keep showing using smart product ranking until next month.
        </SectionHelper>
      )}

      {current && billing.limits && (
        <Layout>
          <Cell span={7}>
            <Card stretchVertically>
          <Card.Header title="Your plan" subtitle={billing.isDevelopment ? 'Development override' : 'Billed through Wix'} suffix={planBadge(billing)} />
              <Card.Divider />
              <Card.Content>
                <Box direction="vertical" gap="SP4">
                  <Box direction="vertical" gap="SP1">
                    <Heading size="large">{current.id}</Heading>
                    {billing.billingCycle && CYCLE_LABELS[billing.billingCycle] && (
                      <Text size="small" secondary>
                        {CYCLE_LABELS[billing.billingCycle]} ·{' '}
                        {formatPrice(billing.billingCycle === 'YEARLY' ? current.yearlyMonthlyPrice : current.monthlyPrice)}/month
                      </Text>
                    )}
                  </Box>
                  <Text>{renewalText(billing)}</Text>
                  <Box>
                    <Button priority="secondary" suffixIcon={<ExternalLink />} disabled={!billing.upgradeUrl} onClick={openPricing}>
                      Manage plan
                    </Button>
                  </Box>
                </Box>
              </Card.Content>
            </Card>
          </Cell>

          <Cell span={5}>
            <Card stretchVertically>
              <Card.Header title="Usage" subtitle="This month" />
              <Card.Divider />
              <Card.Content>
                <Box direction="vertical" gap="SP4">
                  <UsageMeter
                    label="AI recommendations"
                    used={billing.monthlyUsage}
                    limit={billing.limits.monthlyAiRecommendations}
                    unit="requests"
                  />
                  <UsageMeter
                    label="Active campaigns"
                    used={billing.activeCampaigns}
                    limit={billing.limits.maxActiveCampaigns}
                    unit="campaigns"
                  />
                </Box>
              </Card.Content>
            </Card>
          </Cell>
        </Layout>
      )}

      <Layout>
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = billing.plan === id || (billing.isDevelopment && id === 'Business');
          return (
            <Cell key={id} span={6}>
              <Card stretchVertically>
                <Card.Header
                  title={plan.id}
                  subtitle={PLAN_TAGLINES[id]}
                  suffix={isCurrent ? <Badge skin="success">Current plan</Badge> : undefined}
                />
                <Card.Divider />
                <Card.Content>
                  <Box direction="vertical" gap="SP4">
                    <Box direction="vertical" gap="SP1">
                      <Heading size="large">{formatPrice(plan.monthlyPrice)}/month</Heading>
                      <Text size="small" secondary>
                        or {formatPrice(plan.yearlyMonthlyPrice)}/month billed yearly · {plan.trialDays}-day free trial
                      </Text>
                    </Box>
                    <Box direction="vertical" gap="SP3">
                      {COMPARISON.map((row, index) => (
                        <Box key={row.title} direction="vertical" gap="SP3">
                          {index > 0 && <Divider />}
                          <Box gap="SP3" verticalAlign="middle">
                            <Box flexGrow={1}>
                              <Text size="small" skin={row.value(plan) === false ? 'disabled' : 'standard'}>{row.title}</Text>
                            </Box>
                            <ComparisonValue value={row.value(plan)} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    {!isCurrent && (
                      <Box>
                        <Button
                          skin={id === 'Business' ? 'premium' : 'standard'}
                          prefixIcon={id === 'Business' ? <Premium /> : undefined}
                          disabled={!billing.upgradeUrl}
                          onClick={openPricing}
                        >
                          {current ? `Switch to ${plan.id}` : `Start free trial`}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Card.Content>
              </Card>
            </Cell>
          );
        })}
      </Layout>
    </Box>
  );
};
