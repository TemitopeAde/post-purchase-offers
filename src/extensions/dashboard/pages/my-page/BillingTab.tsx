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
import { translate, type Locale } from '../../../../lib/i18n';

// Same workaround as my-page.tsx: WDS Box's typings clash with this project's React types.
const Box = WdsBox as any;

const PLAN_ORDER: PlanId[] = ['Pro', 'Business'];

// Each row renders a value per plan: a string, or a boolean shown as a check or a lock.
const COMPARISON: { title: Parameters<typeof translate>[1]; value: (plan: PlanDefinition, locale: Locale) => string | boolean }[] = [
  { title: 'activeCampaigns', value: (p, loc) => p.limits.maxActiveCampaigns?.toLocaleString(loc) ?? 'unlimited' },
  { title: 'aiRecommendations', value: (p, loc) => p.limits.monthlyAiRecommendations.toLocaleString(loc) },
  { title: 'smartProductRanking', value: () => true },
  { title: 'targetingByProduct', value: (p) => p.limits.advancedTargeting },
  { title: 'stackedTargeting', value: (p) => p.limits.stackedRules },
  { title: 'aiExplanations', value: (p) => p.limits.aiExplanations },
  { title: 'analyticsHistory', value: (p) => (p.limits.analyticsDays ? `days:${p.limits.analyticsDays}` : 'allHistory') },
  { title: 'support', value: (p) => (p.limits.prioritySupport ? 'priority' : 'email') },
];

const USAGE_WARNING_PERCENT = 80;

const formatDate = (iso?: string | null, locale?: Locale) =>
  iso ? new Date(iso).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' }) : undefined;

const formatPrice = (amount: number, locale: Locale = 'en') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount % 1 === 0 ? amount : amount.toFixed(2)}`;
  }
};

const percentOf = (used: number, limit: number) => (limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0);

function planBadge(billing: BillingStatus, t: (key: Parameters<typeof translate>[1]) => string): ReactNode {
  if (billing.isDevelopment) return <Badge skin="premium">{t('development')}</Badge>;
  if (!billing.plan) return <Badge skin="danger">{t('noPlan')}</Badge>;
  if (billing.freeTrial?.status === 'IN_PROGRESS') return <Badge skin="premium">{t('freeTrial')}</Badge>;
  if (billing.autoRenewing === false) return <Badge skin="warning">{t('notRenewing')}</Badge>;
  return <Badge skin="success">{t('active')}</Badge>;
}

function renewalText(
  billing: BillingStatus,
  t: (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) => string,
  locale: Locale,
): string {
  if (billing.isDevelopment) return t('allPlanFeatures');
  const date = formatDate(billing.expirationDate, locale);
  if (!date) return t('planActive');
  return billing.autoRenewing === false ? t('planEndsRenewalOff', { date }) : t('planRenews', { date });
}

const ComparisonValue: FC<{ value: string | boolean }> = ({ value }) =>
  typeof value === 'string' ? (
    <Text size="small">{value}</Text>
  ) : (
    <Text skin={value ? 'success' : 'disabled'}>{value ? <Check /> : <LockLocked />}</Text>
  );

const UsageMeter: FC<{
  label: string;
  used: number;
  limit: number | null;
  unit: string;
  locale: Locale;
  t: (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) => string;
}> = ({ label, used, limit, unit, locale, t }) => {
  if (limit === null) {
    return (
      <Box direction="vertical" gap="SP1">
        <Text weight="bold">{label}</Text>
        <Text size="small" secondary>{t('usedUnlimited', { used: used.toLocaleString(locale), unit })}</Text>
      </Box>
    );
  }
  const percent = percentOf(used, limit);
  return (
    <Box direction="vertical" gap="SP2">
      <Text weight="bold">{label}</Text>
      <Text size="small" secondary>{t('usedOfLimit', { used: used.toLocaleString(locale), limit: limit.toLocaleString(locale), unit })}</Text>
      <LinearProgressBar
        value={percent}
        showProgressIndication
        skin={percent >= USAGE_WARNING_PERCENT ? 'warning' : 'standard'}
        aria-label={t('usedProgressAria', { label })}
      />
    </Box>
  );
};

export const BillingTab: FC<{ billing: BillingStatus | null; locale: Locale }> = ({ billing, locale }) => {
  const t = (key: Parameters<typeof translate>[1], values?: Record<string, string | number>) => translate(locale, key, values);
  if (!billing || 'error' in billing) {
    return (
      <Card>
        <Card.Content>
          <EmptyState
            title={t('billingUnavailable')}
            subtitle={t('billingUnavailableSubtitle')}
          />
        </Card.Content>
      </Card>
    );
  }

  const openPricing = () => billing.upgradeUrl && window.open(billing.upgradeUrl, '_blank', 'noopener');
  const current = billing.plan ? PLANS[billing.plan] : billing.isDevelopment ? PLANS.Business : null;
  const trialEnds = billing.freeTrial?.status === 'IN_PROGRESS' ? formatDate(billing.freeTrial.endDate, locale) : undefined;
  const aiPercent = billing.limits ? percentOf(billing.monthlyUsage, billing.limits.monthlyAiRecommendations) : 0;

  return (
    <Box direction="vertical" gap="SP4">
      {!billing.fromWixBilling && (
        <SectionHelper skin="warning" title={t('showingSavedPlan')}>
          {t('savedPlanDescription')}
        </SectionHelper>
      )}

      {billing.isDevelopment && (
        <SectionHelper skin="premium" title={t('developmentMode')}>
          {t('developmentDescription')}
        </SectionHelper>
      )}

      {!current && (
        <SectionHelper
          skin="danger"
          title={t('offersOff')}
          actionText={billing.upgradeUrl ? t('choosePlan') : undefined}
          onAction={billing.upgradeUrl ? openPricing : undefined}
        >
          {t('choosePlanDescription', { days: PLANS.Pro.trialDays })}
        </SectionHelper>
      )}

      {trialEnds && (
        <SectionHelper
          skin="premium"
          title={t('planEnds', { date: trialEnds })}
          actionText={billing.upgradeUrl ? t('managePlan') : undefined}
          onAction={billing.upgradeUrl ? openPricing : undefined}
        >
          {t('planStarts')}
        </SectionHelper>
      )}

      {current && billing.limits && aiPercent >= USAGE_WARNING_PERCENT && (
        <SectionHelper
          skin="warning"
          title={t('usedMonthlyRecommendations', { percent: aiPercent })}
          actionText={billing.plan === 'Pro' && billing.upgradeUrl ? t('upgradeBusiness') : undefined}
          onAction={billing.plan === 'Pro' && billing.upgradeUrl ? openPricing : undefined}
        >
          {t('allowanceExceededFallback')}
        </SectionHelper>
      )}

      {current && billing.limits && (
        <Layout>
          <Cell span={7}>
            <Card stretchVertically>
              <Card.Header title={t('yourPlan')} subtitle={billing.isDevelopment ? t('developmentOverride') : t('billedThroughWix')} suffix={planBadge(billing, t)} />
              <Card.Divider />
              <Card.Content>
                <Box direction="vertical" gap="SP4">
                  <Box direction="vertical" gap="SP1">
                    <Heading size="large">{current.id}</Heading>
                    {billing.billingCycle && (
                      <Text size="small" secondary>
                        {t(billing.billingCycle === 'MONTHLY' ? 'billedMonthly' : billing.billingCycle === 'YEARLY' ? 'billedYearly' : billing.billingCycle === 'TWO_YEARS' ? 'billedTwoYears' : billing.billingCycle === 'THREE_YEARS' ? 'billedThreeYears' : 'oneTimePurchase')} ·{' '}
                        {formatPrice(billing.billingCycle === 'YEARLY' ? current.yearlyMonthlyPrice : current.monthlyPrice, locale)}/{t('month')}
                      </Text>
                    )}
                  </Box>
                  <Text>{renewalText(billing, t, locale)}</Text>
                  <Box>
                    <Button priority="secondary" suffixIcon={<ExternalLink />} disabled={!billing.upgradeUrl} onClick={openPricing}>
                      {t('managePlan')}
                    </Button>
                  </Box>
                </Box>
              </Card.Content>
            </Card>
          </Cell>

          <Cell span={5}>
            <Card stretchVertically>
              <Card.Header title={t('usage')} subtitle={t('thisMonth')} />
              <Card.Divider />
              <Card.Content>
                <Box direction="vertical" gap="SP4">
                  <UsageMeter
                    label={t('aiRecommendations')}
                    used={billing.monthlyUsage}
                    limit={billing.limits.monthlyAiRecommendations}
                    unit={t('requests')}
                    locale={locale}
                    t={t}
                  />
                  <UsageMeter
                    label={t('activeCampaigns')}
                    used={billing.activeCampaigns}
                    limit={billing.limits.maxActiveCampaigns}
                    unit={t('campaignsUnit')}
                    locale={locale}
                    t={t}
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
                  subtitle={t(id === 'Pro' ? 'planTaglinePro' : 'planTaglineBusiness')}
                  suffix={isCurrent ? <Badge skin="success">{t('currentPlan')}</Badge> : undefined}
                />
                <Card.Divider />
                <Card.Content>
                  <Box direction="vertical" gap="SP4">
                    <Box direction="vertical" gap="SP1">
                      <Heading size="large">{formatPrice(plan.monthlyPrice, locale)}/{t('month')}</Heading>
                      <Text size="small" secondary>
                        {t('orBilledYearly', { price: formatPrice(plan.yearlyMonthlyPrice, locale), days: plan.trialDays })}
                      </Text>
                    </Box>
                    <Box direction="vertical" gap="SP3">
                      {COMPARISON.map((row, index) => (
                        <Box key={row.title} direction="vertical" gap="SP3">
                          {index > 0 && <Divider />}
                          <Box gap="SP3" verticalAlign="middle">
                            <Box flexGrow={1}>
                              <Text size="small" skin={row.value(plan, locale) === false ? 'disabled' : 'standard'}>{t(row.title)}</Text>
                            </Box>
                            <ComparisonValue value={(() => {
                              const value = row.value(plan, locale);
                              if (value === 'unlimited') return t('unlimited');
                              if (value === 'allHistory') return t('allHistory');
                              if (value === 'priority') return t('priority');
                              if (value === 'email') return t('email');
                              if (typeof value === 'string' && value.startsWith('days:')) return `${Number(value.slice(5)).toLocaleString(locale)} ${t('days')}`;
                              return value;
                            })()} />
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
                          {current ? t('switchTo', { plan: plan.id }) : t('startFreeTrial')}
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
