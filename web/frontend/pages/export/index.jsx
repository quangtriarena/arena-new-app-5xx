import { Stack, Card } from '@shopify/polaris'
import { useEffect } from 'react'
import AppHeader from '../../components/AppHeader'
import Table from './Table'

function IndexPage(props) {
  return (
    <Stack vertical alignment="fill">
      <AppHeader
        {...props}
        title="Export data"
        onBack={() => props.navigate('/')}
        primaryActions={[
          {
            label: 'Contact us',
            onClick: () => props.navigate('/support'),
          },
          {
            label: 'Create new export',
            onClick: () => props.navigate('/export/new'),
            primary: true,
          },
        ]}
      />

      <Card>
        <Table {...props} uuid={props.storeSetting.uuid} />
      </Card>
    </Stack>
  )
}

export default IndexPage
