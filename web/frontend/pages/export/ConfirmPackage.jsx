import PropTypes from 'prop-types'
import { useEffect, useState, version } from 'react'
import { Modal, Select, Spinner, Stack, TextContainer } from '@shopify/polaris'
import formatDateTime from '../../helpers/formatDateTime'

ConfirmPackage.propTypes = {
  // ...appProps,
  selected: PropTypes.object,
  onDiscard: PropTypes.func,
  onSubmit: PropTypes.func,
}

ConfirmPackage.defaultProps = {
  onDiscard: () => null,
  onSubmit: () => null,
}

function ConfirmPackage(props) {
  const { actions, selected, onSubmit, onDiscard } = props

  const logs = selected.logs.filter((item) => item.status === 'COMPLETED' && item.result?.Location)

  const [logSelected, setLogSelected] = useState(logs[0])

  return (
    <Modal
      open={true}
      onClose={onDiscard}
      title="Import confirmation"
      secondaryActions={[
        {
          content: 'Discard',
          onAction: onDiscard,
        },
        {
          content: 'Import now',
          onAction: () => onSubmit(logSelected),
          disabled: !Boolean(logSelected),
          primary: Boolean(logSelected),
        },
      ]}
    >
      {!logSelected && (
        <Modal.Section subdued>
          <Stack distribution="center">
            <div>No packages available</div>
          </Stack>
        </Modal.Section>
      )}
      {logSelected && (
        <Modal.Section subdued>
          <Select
            label="Select a package"
            options={logs.map((item, index) => ({
              label: `${item.name} - ${formatDateTime(item.updatedAt, 'LLL')}`,
              value: String(item.id),
            }))}
            value={String(logSelected.id)}
            onChange={(value) => setLogSelected(logs.find((item) => item.id == value))}
          />
        </Modal.Section>
      )}
      {logSelected && (
        <Modal.Section subdued>
          <Stack vertical alignment="fill">
            <Stack vertical spacing="extraTight">
              <Stack spacing="tight" wrap={false}>
                <div style={{ minWidth: 90 }}>Name</div>
                <div>:</div>
                <div>{logSelected.name}</div>
              </Stack>
              <Stack spacing="tight" wrap={false}>
                <div style={{ minWidth: 90 }}>Description</div>
                <div>:</div>
                <div style={{ maxWidth: 300 }}>{logSelected.description}</div>
              </Stack>
              <Stack spacing="tight" wrap={false}>
                <div style={{ minWidth: 90 }}>Last updated</div>
                <div>:</div>
                <div>{formatDateTime(logSelected.updatedAt, 'LLL')}</div>
              </Stack>
            </Stack>
            <Stack.Item>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }}>
                <thead style={{ backgroundColor: '#f1f1f1' }}>
                  <tr>
                    <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Resource</th>
                    <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Count</th>
                    <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Columns</th>
                    <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Filters</th>
                  </tr>
                </thead>
                <tbody>
                  {logSelected.resources.map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>
                        {item.type.replace(/_/g, ' ').toUpperCase()}S
                      </td>
                      <td
                        style={{
                          border: '1px solid #dcdcdc',
                          padding: '0.5em 1em',
                          textAlign: 'center',
                        }}
                      >
                        {item.count}
                      </td>
                      <td style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>
                        all columns
                      </td>
                      <td style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>
                        all resources
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Stack.Item>
          </Stack>
        </Modal.Section>
      )}
    </Modal>
  )
}

export default ConfirmPackage
