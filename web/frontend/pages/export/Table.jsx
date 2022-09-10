import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { ActionList, Badge, Button, DataTable, Popover, Stack } from '@shopify/polaris'
import formatDateTime from '../../helpers/formatDateTime'
import { MobileVerticalDotsMajor, ImagesMajor } from '@shopify/polaris-icons'
import DuplicatorPackageApi from '../../apis/duplicator_package'
import ConfirmModal from '../../components/ConfirmModal'
import ConfirmPackage from './ConfirmPackage'
import PackageLogs from './PackageLogs'

Table.propTypes = {
  // ...appProps,
  uuid: PropTypes.string,
  onLoading: PropTypes.func,
}

Table.defaultProps = {
  uuid: '',
  onLoading: () => null,
}

const BadgeStatuses = {
  ACTIVE: 'success',
  DRAFT: '',
  ARCHIVED: '',
}

function Table(props) {
  const { actions, storeSetting, uuid, onLoading } = props

  const [backupPackages, setBackupPackages] = useState(null)
  const [selected, setSelected] = useState(null)
  const [packageLogsSelected, setPackageLogsSelected] = useState(null)
  const [deleted, setDeleted] = useState(null)
  const [archived, setArchived] = useState(null)
  const [imported, setImported] = useState(null)

  const getBackupPackages = async () => {
    try {
      setBackupPackages(null)
      onLoading(true)

      let where = {}
      if (uuid !== storeSetting.uuid) {
        where = { ...where, status: 'ACTIVE' }
      }
      let query = `?uuid=${uuid}&where=${JSON.stringify(where)}`
      let res = await DuplicatorPackageApi.find(query)
      if (!res.success) throw res.error

      setBackupPackages(res.data)
      onLoading(false)
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    }
  }

  useEffect(() => {
    getBackupPackages()
  }, [uuid])

  const handleEdit = (edited) => {
    return props.navigate(`/export/${edited.id}`)
  }

  const handleDelete = async (deleted) => {
    try {
      actions.showAppLoading()

      let res = await DuplicatorPackageApi.delete(deleted.id)
      if (!res.success) throw res.error

      setBackupPackages({
        ...backupPackages,
        items: backupPackages.items.filter((item) => item.id !== deleted.id),
      })

      actions.showNotify({ message: 'Deleted' })
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    } finally {
      actions.hideAppLoading()
    }
  }

  const handleArchive = async (archived) => {
    try {
      actions.showAppLoading()

      let res = await DuplicatorPackageApi.update(archived.id, {
        status: archived.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE',
      })
      if (!res.success) throw res.error

      setBackupPackages({
        ...backupPackages,
        items: backupPackages.items
          .map((item) => (item.id === archived.id ? res.data : item))
          .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : a.updatedAt < b.updatedAt ? 1 : 0)),
      })

      actions.showNotify({ message: archived.status === 'ACTIVE' ? 'Archived' : 'Actived' })
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    } finally {
      actions.hideAppLoading()
    }
  }

  const handleImport = async ({ imported, log }) => {
    try {
      actions.showAppLoading()

      let res = await DuplicatorPackageApi.import({
        uuid,
        duplicatorPackageId: imported.id,
        logId: log.id,
      })
      if (!res.success) throw res.error

      actions.showNotify({ message: 'Process is running in background. Waiting for finnish.' })

      props.navigate('/history-actions')
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    } finally {
      actions.hideAppLoading()
    }
  }

  const renderActionList = (item) => {
    let actionList = []

    if (storeSetting.uuid === uuid) {
      actionList.push({
        content: 'Edit',
        onAction: () => handleEdit(item) & setSelected(null),
      })
      actionList.push({
        content: 'Delete',
        onAction: () => setDeleted(item) & setSelected(null),
      })
      actionList.push({
        content: item.status === 'ACTIVE' ? 'Move to Archived' : 'Move to Active',
        onAction: () => setArchived(item) & setSelected(null),
      })
    }

    actionList.push({
      content: 'Import',
      onAction: () => setImported(item) & setSelected(null),
      disabled: !['ACTIVE'].includes(item.status),
    })

    return actionList
  }

  let rows = []
  if (backupPackages?.items?.length) {
    rows = backupPackages?.items.map((item, index) => {
      return [
        index + 1,
        <div style={{ maxWidth: 240, whiteSpace: 'normal' }}>
          <p>
            <b>{item.name}</b>
          </p>
          <p>{item.description}</p>
        </div>,
        <Badge status={BadgeStatuses[item.status]}>{item.status}</Badge>,
        <Button plain onClick={() => setPackageLogsSelected(item)}>
          {item.logs.length} packages
        </Button>,
        formatDateTime(item.updatedAt, 'LLL'),
        <Popover
          active={item.id === selected?.id}
          activator={
            <Button
              plain
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              icon={MobileVerticalDotsMajor}
            />
          }
          onClose={() => setSelected(null)}
        >
          <ActionList actionRole="menuitem" items={renderActionList(item)} />
        </Popover>,
      ]
    })
  }

  return (
    <div>
      <DataTable
        headings={['No.', 'Package Name', 'Status', 'Package Logs', 'Last Updated', 'Action']}
        columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text']}
        rows={rows}
        footerContent={
          backupPackages?.items
            ? backupPackages?.items?.length > 0
              ? undefined
              : 'Have no data'
            : 'loading..'
        }
      />

      {packageLogsSelected && (
        <PackageLogs selected={packageLogsSelected} onClose={() => setPackageLogsSelected(null)} />
      )}

      {deleted && (
        <ConfirmModal
          title="Delete confirmation"
          content="Are you sure want to delete package? This cannot be undone."
          onClose={() => setDeleted(null)}
          actions={[
            {
              content: 'Discard',
              onAction: () => setDeleted(null),
            },
            {
              content: 'Delete now',
              onAction: () => handleDelete(deleted) & setDeleted(null),
              destructive: true,
            },
          ]}
        />
      )}

      {archived && (
        <ConfirmModal
          title={`${archived.status === 'ACTIVE' ? 'Archived' : 'Active'} confirmation`}
          content={`Are you sure you want to ${
            archived.status === 'ACTIVE' ? 'archive' : 'active'
          } package. You can undo again.`}
          onClose={() => setArchived(null)}
          actions={[
            {
              content: 'Discard',
              onAction: () => setArchived(null),
            },
            {
              content: `${archived.status === 'ACTIVE' ? 'Archive' : 'Active'} now`,
              onAction: () => handleArchive(archived) & setArchived(null),
              destructive: archived.status === 'ACTIVE',
              primary: archived.status === 'ARCHIVED',
            },
          ]}
        />
      )}

      {imported && (
        <ConfirmPackage
          {...props}
          selected={imported}
          onSubmit={(log) => handleImport({ imported, log }) & setImported(null)}
          onDiscard={() => setImported(null)}
        />
      )}
    </div>
  )
}

export default Table
