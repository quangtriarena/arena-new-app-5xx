import { Stack, Button, DisplayText, Card, Popover, ActionList } from '@shopify/polaris'
import AppHeader from '../../components/AppHeader'
import { useEffect, useState } from 'react'
import DuplicatorPackageApi from '../../apis/duplicator_package'
import DuplicatoreStore from './DuplicatorStore'
import { RefreshMinor } from '@shopify/polaris-icons'
import Table from '../export/Table'

function IndexPage(props) {
  const { actions, storeSetting } = props

  const [duplicatorStore, setDuplicatorStore] = useState(null)
  const [popoverActive, setPopoverActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (storeSetting.duplicators[0]) {
      setDuplicatorStore(storeSetting.duplicators[0])
    }
  }, [storeSetting])

  return (
    <Stack vertical alignment="fill">
      <AppHeader
        {...props}
        title="Import data"
        onBack={() => props.navigate('/')}
        primaryActions={[
          {
            label: 'Contact us',
            onClick: () => props.navigate('/support'),
          },
        ]}
      />

      <DuplicatoreStore {...props} />

      {duplicatorStore && (
        <Card>
          <Card.Section>
            <Stack distribution="equalSpacing">
              <Popover
                active={popoverActive}
                activator={
                  <Button
                    disclosure
                    onClick={() => setPopoverActive(!popoverActive)}
                    disabled={storeSetting.duplicators.length === 1 || isLoading}
                  >
                    <span
                      className={
                        storeSetting.duplicators.length === 1 || isLoading ? '' : 'color__link'
                      }
                    >
                      <b>
                        {duplicatorStore.name} ({duplicatorStore.shop})
                      </b>
                    </span>
                  </Button>
                }
                onClose={() => setPopoverActive(false)}
              >
                <ActionList
                  actionRole="menuitem"
                  items={storeSetting.duplicators
                    .filter((item) => item.uuid !== duplicatorStore.uuid)
                    .map((item) => ({
                      content: `${item.name} (${item.shop})`,
                      onAction: () => setDuplicatorStore(item) & setPopoverActive(false),
                    }))}
                />
              </Popover>
            </Stack>
          </Card.Section>

          <Table
            {...props}
            uuid={duplicatorStore.uuid}
            onLoading={(value) => setIsLoading(value)}
          />
        </Card>
      )}
    </Stack>
  )
}

export default IndexPage
