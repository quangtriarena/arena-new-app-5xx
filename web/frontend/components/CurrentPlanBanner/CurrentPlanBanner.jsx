import { Banner } from '@shopify/polaris'

const BadgeStatuses = {
  BASIC: 'warning',
  PRO: 'info',
  PLUS: 'success',
}

function CurrentPlanBanner(props) {
  const { storeSetting, location, navigate } = props

  return (
    <Banner
      title={`Current plan: ${storeSetting.appPlan}`}
      status={BadgeStatuses[storeSetting.appPlan]}
      action={
        storeSetting.appPlan !== 'PLUS'
          ? { content: 'Upgrade Plan', onAction: () => navigate('/plans') }
          : undefined
      }
      secondaryAction={{
        content: 'Read more about Pricing plans',
        onAction: () => navigate('/plans'),
      }}
    >
      {Boolean(storeSetting.appPlan === 'BASIC') && (
        <p>
          You are now testing Export &amp; Duplication with up to 10 items per file. With as many
          files as you want. For unlimited time.
        </p>
      )}
    </Banner>
  )
}

export default CurrentPlanBanner
