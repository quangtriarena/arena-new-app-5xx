import { Card, Stack, Button, Layout, DisplayText, MediaCard } from '@shopify/polaris'
import AppHeader from '../components/AppHeader'
import CurrentPlanBanner from '../components/CurrentPlanBanner/CurrentPlanBanner'
import UniqueCodeCard from '../components/UniqueCodeCard'
import DuplicatoreStoreCard from '../components/DuplicatorStoreCard'
import SubmitionButton from '../components/SubmitionButton'
import { backupImage } from '../assets'

export default function HomePage(props) {
  return (
    <Stack vertical alignment="fill">
      <AppHeader
        {...props}
        title="Home"
        primaryActions={[
          {
            label: 'Contact us',
            onClick: () => props.navigate('/support'),
          },
        ]}
      />

      <CurrentPlanBanner {...props} />

      <Layout>
        <Layout.Section oneHalf>
          <UniqueCodeCard {...props} />
        </Layout.Section>
        <Layout.Section oneHalf>
          <DuplicatoreStoreCard {...props} />
        </Layout.Section>
      </Layout>

      <MediaCard
        title="Export"
        primaryAction={{
          content: 'New Export',
          onAction: () => props.navigate('/export/new'),
        }}
        description="You will be able to select the particular data items to backup."
        popoverActions={[{ content: 'Support', onAction: () => props.navigate('/support') }]}
      >
        <img
          alt=""
          width="100%"
          height="100%"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            backgroundColor: '#f6f6f7',
          }}
          src={backupImage}
        />
      </MediaCard>

      {window.shopOrigin === 'haloha-shop.myshopify.com' && <SubmitionButton {...props} />}
    </Stack>
  )
}
