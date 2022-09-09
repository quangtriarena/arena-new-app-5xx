import { Badge, Modal } from '@shopify/polaris'
import PropTypes from 'prop-types'
import formatDateTime from '../../helpers/formatDateTime'

PackageLogs.propTypes = {
  selected: PropTypes.object,
  onClose: PropTypes.func,
}

PackageLogs.defaultProps = {
  onClose: () => null,
}

const BadgeStatuses = {
  COMPLETED: 'success',
  PENDING: 'warning',
  RUNNING: 'info',
  FAILED: 'critical',
  CANCELED: 'attention',
}

function PackageLogs(props) {
  const { selected, onClose } = props

  return (
    <Modal
      large
      open={true}
      onClose={onClose}
      title="Package logs"
      secondaryActions={[
        {
          content: 'Close',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9em' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f1f1' }}>
              <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>No.</th>
              <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Package Name</th>
              <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Status</th>
              <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Message</th>
              <th style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {selected.logs.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: '1px solid #dcdcdc',
                    padding: '0.5em 1em',
                    textAlign: 'center',
                  }}
                >
                  {index + 1}
                </td>
                <td style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>
                  <div>
                    <b>{item.name}</b>
                  </div>
                  <div style={{ maxWidth: 240 }}>{item.description}</div>
                </td>
                <td
                  style={{
                    border: '1px solid #dcdcdc',
                    padding: '0.5em 1em',
                    textAlign: 'center',
                  }}
                >
                  <Badge status={BadgeStatuses[item.status]}>{item.status}</Badge>
                </td>
                <td style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>
                  <div style={{ maxWidth: 240 }}>{item.message}</div>
                </td>
                <td style={{ border: '1px solid #dcdcdc', padding: '0.5em 1em' }}>
                  {formatDateTime(item.updatedAt, 'LLL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Modal.Section>
    </Modal>
  )
}

export default PackageLogs
