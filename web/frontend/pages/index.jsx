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

      <Card sectioned title="New Export">
        <Stack vertical>
          <div>You will be able to select the particular data items to backup.</div>
          <Button primary onClick={() => props.navigate('/export/new')}>
            New Export
          </Button>
        </Stack>
      </Card>

      <Layout>
        <Layout.AnnotatedSection title="Tutorials" description="">
          <Card sectioned>
            <Stack vertical>
              <div>Here you will find a collection of written and video tutorials.</div>
              <Button onClick={() => props.navigate('')}>See tutorials</Button>
            </Stack>
          </Card>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection title="Documentation" description="">
          <Card sectioned>
            <Stack vertical>
              <div>Specification for each kind of item, each and every field.</div>
              <Button onClick={() => props.navigate('')}>Read documentation</Button>
            </Stack>
          </Card>
        </Layout.AnnotatedSection>
        <Layout.AnnotatedSection title="Support" description="">
          <Card sectioned>
            <Stack vertical>
              <div>
                If you have any questions, issues or concerns - don't guess, don't wait - contact us
                and we will help you.
              </div>
              <Button onClick={() => props.navigate('/support')}>Contact support</Button>
            </Stack>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>

      {/* <SubmitionButton {...props} /> */}
    </Stack>
  )
}
