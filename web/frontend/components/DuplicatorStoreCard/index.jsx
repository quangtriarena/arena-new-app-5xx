import { Button, Card, DisplayText, Stack, TextField } from '@shopify/polaris'
import { useEffect } from 'react'

function DuplicatoreStoreCard(props) {
  const { navigate } = props

  return (
    <Card>
      <Card.Section>
        <Stack distribution="center">
          <DisplayText size="small">Duplicator Store</DisplayText>
        </Stack>
      </Card.Section>
      <Card.Section>
        <Stack vertical alignment="center">
          <div>Add your duplicator store and import data from package.</div>
          <Button primary onClick={() => navigate('/import')}>
            Add Duplicator Store
          </Button>
        </Stack>
      </Card.Section>
      <Card.Section subdued>
        <div className="color__note" style={{ textAlign: 'center' }}>
          This app makes it easy to duplicate a store's content onto another, either to spin up a
          staging.
        </div>
      </Card.Section>
    </Card>
  )
}

export default DuplicatoreStoreCard
