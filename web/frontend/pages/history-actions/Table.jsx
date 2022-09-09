import PropTypes from 'prop-types'
import { ActionList, Badge, Button, DataTable, Popover, Stack } from '@shopify/polaris'
import { MobileVerticalDotsMajor, ImagesMajor } from '@shopify/polaris-icons'
import { useState } from 'react'
import formatDateTime from '../../helpers/formatDateTime'
import ImportResult from './ImportResult'
import ConfirmModal from '../../components/ConfirmModal'

Table.propTypes = {
  // ...appProps,
  items: PropTypes.array,
  onDelete: PropTypes.func,
  onCancel: PropTypes.func,
  onRerun: PropTypes.func,
}

Table.defaultProps = {
  items: null,
  onDelete: () => null,
  onCancel: () => null,
  onRerun: () => null,
}

const Types = {
  duplicator_export: 'EXPORT',
  duplicator_import: 'IMPORT',
}

const TypeBadgeStatuses = {
  duplicator_export: 'success',
  duplicator_import: 'info',
}

const BadgeStatuses = {
  COMPLETED: 'success',
  PENDING: 'warning',
  RUNNING: 'info',
  FAILED: 'critical',
  CANCELED: 'attention',
}

function Table(props) {
  const { items, onCancel, onDelete, onRerun } = props

  const [selected, setSelected] = useState(null)
  const [deleted, setDeleted] = useState(null)
  const [canceled, setCanceled] = useState(null)
  const [reruned, setReruned] = useState(null)
  const [imported, setImported] = useState(null)

  const styles = {
    label: {
      minWidth: 140,
    },
    content: {
      maxWidth: 280,
      whiteSpace: 'normal',
    },
  }

  let rows = []
  if (items?.length > 0) {
    rows = items.map((item, index) => [
      index + 1,
      <Badge status={TypeBadgeStatuses[item.type]}>{Types[item.type]}</Badge>,
      <Badge status={BadgeStatuses[item.status]}>
        {item.status}
        {item.status === 'RUNNING' && item.progress !== 0 && item.progress !== 100
          ? ` ${item.progress}%`
          : ``}
      </Badge>,
      <Stack vertical spacing="extraTight">
        {Boolean(item.data?.name) && (
          <Stack spacing="tight" alignment="baseline" wrap={false}>
            <div style={styles.label}>Package name</div>
            <div>:</div>
            <div style={styles.content}>{item.data?.name}</div>
          </Stack>
        )}
        {Boolean(item.data?.description) && (
          <Stack spacing="tight" alignment="baseline" wrap={false}>
            <div style={styles.label}>Package description</div>
            <div>:</div>
            <div style={styles.content}>{item.data?.description}</div>
          </Stack>
        )}
        {Boolean(
          item.type === 'duplicator_export' &&
            item.result?.Location &&
            window.shopOrigin === 'haloha-shop.myshopify.com'
        ) && (
          <Stack spacing="tight" alignment="baseline" wrap={false}>
            <div style={styles.label}>Exported file</div>
            <div>:</div>
            <Button plain external url={item.result?.Location}>
              Download
            </Button>
          </Stack>
        )}
        {Boolean(item.type === 'duplicator_import' && item.result?.length > 0) && (
          <Stack spacing="tight" alignment="baseline" wrap={false}>
            <div style={styles.label}>Result</div>
            <div>:</div>
            <Button plain onClick={() => setImported(item)}>
              Show details
            </Button>
          </Stack>
        )}
        {Boolean(item.message) && (
          <Stack spacing="tight" alignment="baseline" wrap={false}>
            <div style={styles.label}>Message</div>
            <div>:</div>
            <div style={styles.content} className={item.status === 'FAILED' ? 'color__error' : ''}>
              {item.message}
            </div>
          </Stack>
        )}
        <Stack spacing="tight" alignment="baseline" wrap={false}>
          <div style={styles.label}>Updated At</div>
          <div>:</div>
          <div style={styles.content} className="color__note">
            {formatDateTime(new Date(item.updatedAt), 'LLL')}
          </div>
        </Stack>
      </Stack>,
      <Stack distribution="center">
        <Popover
          active={item.id === selected?.id}
          activator={
            <Button
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              icon={MobileVerticalDotsMajor}
              plain
            />
          }
          onClose={() => setSelected(null)}
        >
          <ActionList
            actionRole="menuitem"
            items={(() => {
              let items = []

              if (['PENDING', 'RUNNING'].includes(item.status)) {
                items.push({
                  content: 'Cancel',
                  onAction: () => setCanceled(item),
                })
              }
              if (['COMPLETED', 'FAILED', 'CANCELED'].includes(item.status)) {
                items.push({
                  content: 'Re-run',
                  onAction: () => setReruned(item),
                })
              }
              if (['COMPLETED', 'FAILED', 'CANCELED'].includes(item.status)) {
                items.push({
                  content: 'Delete',
                  onAction: () => setDeleted(item),
                })
              }

              return items
            })()}
          />
        </Popover>
      </Stack>,
    ])
  }

  return (
    <div>
      <DataTable
        headings={['No.', 'Name', 'Status', 'Advanced', 'Action']}
        columnContentTypes={['text', 'text', 'text', 'text', 'text']}
        rows={rows}
        footerContent={items ? (items.length > 0 ? undefined : 'Have no data') : 'loading..'}
      />

      {deleted && (
        <ConfirmModal
          title="Confirm delete process"
          content="Are you sure you want to delete process? This cannot be undone."
          onClose={() => setDeleted(null)}
          actions={[
            {
              content: 'Discard',
              onAction: () => setDeleted(null),
            },
            {
              content: 'Delete now',
              onAction: () => onDelete(deleted) & setDeleted(null),
              destructive: true,
            },
          ]}
        />
      )}

      {canceled && (
        <ConfirmModal
          title="Confirm cancel process"
          content={
            <div>
              <p>Process is running in background.</p>
              <p>Are you sure you want to cancel process? This cannot be undone.</p>
            </div>
          }
          onClose={() => setCanceled(null)}
          actions={[
            {
              content: 'Discard',
              onAction: () => setCanceled(null),
            },
            {
              content: 'Cancel now',
              onAction: () => onCancel(canceled) & setCanceled(null),
              destructive: true,
            },
          ]}
        />
      )}

      {reruned && (
        <ConfirmModal
          title="Confirm re-run process"
          content="Are you sure you want to re-run process?"
          onClose={() => setReruned(null)}
          actions={[
            {
              content: 'Discard',
              onAction: () => setReruned(null),
            },
            {
              content: 'Re-run now',
              onAction: () => onRerun(reruned) & setReruned(null),
              primary: true,
            },
          ]}
        />
      )}

      {imported && <ImportResult items={imported.result} onClose={() => setImported(null)} />}
    </div>
  )
}

export default Table
