import { Button, Card, DisplayText, Stack } from '@shopify/polaris'
import { useState } from 'react'
import { useCopyToClipboard } from '../../hooks'

function UniqueCodeCard(props) {
  const { storeSetting, actions } = props

  const [lockCode, setLockCode] = useState(true)

  return (
    <Card>
      <Card.Section>
        <Stack distribution="center">
          <DisplayText size="small">Your Store Unique Code</DisplayText>
        </Stack>
      </Card.Section>
      <Card.Section>
        <Stack vertical alignment="center">
          <div className="color__error" style={{ fontSize: '1.1em' }}>
            {lockCode ? 'xxxx-xxxx-xxxx-xxxx-xxxx' : storeSetting.uuid}
          </div>
          <Stack distribution="center">
            <Button
              primary
              onClick={() =>
                useCopyToClipboard(storeSetting.uuid)
                  ? actions.showNotify({ message: 'Copied' })
                  : actions.showNotify({ message: '#Error', error: true })
              }
            >
              <div style={{ minWidth: 90, textAlign: 'center' }}>Copy Code</div>
            </Button>
            <Button onClick={() => setLockCode(!lockCode)}>
              <div style={{ minWidth: 90, textAlign: 'center' }}>
                {lockCode ? 'Unlock Code' : 'Lock Code'}
              </div>
            </Button>
          </Stack>
        </Stack>
      </Card.Section>
      <Card.Section subdued>
        <div className="color__note" style={{ textAlign: 'center' }}>
          Share this unique key with child-stores so that you can import packages to your
          child-stores.
        </div>
      </Card.Section>
    </Card>
  )
}

export default UniqueCodeCard
