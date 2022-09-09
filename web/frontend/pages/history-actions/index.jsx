import { Card, Stack, Pagination, Button } from '@shopify/polaris'
import AppHeader from '../../components/AppHeader'
import { useSearchParams } from 'react-router-dom'
import HistoryActionApi from '../../apis/history_action'
import { useEffect, useState } from 'react'
import Table from './Table'

function HistoryActionsPage(props) {
  const { actions, location, navigate, storeSetting } = props

  const [searchParams, setSearchParams] = useSearchParams()

  const [historyActions, setHistoryActions] = useState(null)

  useEffect(() => console.log('historyActions :>> ', historyActions), [historyActions])

  const getHistoryActions = async (query) => {
    try {
      if (window.__getProgressTimeout) {
        clearTimeout(window.__getProgressTimeout)
      }

      let res = await HistoryActionApi.find(query)
      if (!res.success) throw res.error

      setHistoryActions(res.data)

      // check running job
      let runningJob = res.data.items.find((item) => item.status === 'RUNNING')
      if (runningJob) {
        window.__getProgressTimeout = setTimeout(() => {
          getHistoryActions(query)
        }, 10000)
      }
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    }
  }

  useEffect(() => {
    getHistoryActions(location.search)

    // returned function will be called on component unmount
    return () => {
      clearTimeout(window.__getProgressTimeout)
    }
  }, [location.search])

  const handleDelete = async (deleted) => {
    try {
      actions.showAppLoading()

      let res = await HistoryActionApi.delete(deleted.id)
      if (!res.success) throw res.error

      actions.showNotify({ message: 'Deleted' })

      getHistoryActions(location.search)
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    } finally {
      actions.hideAppLoading()
    }
  }

  const handleCancel = async (canceled) => {
    try {
      actions.showAppLoading()

      let res = await HistoryActionApi.update(canceled.id, {
        status: 'CANCELED',
        message: 'Canceled by user',
      })
      if (!res.success) throw res.error

      let _historyActions = { ...historyActions }
      _historyActions.items = historyActions.items.map((item) =>
        item.id === canceled.id ? res.data : item
      )
      setHistoryActions(_historyActions)

      actions.showNotify({ message: 'Canceled' })
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    } finally {
      actions.hideAppLoading()
    }
  }

  return (
    <Stack vertical alignment="fill">
      <AppHeader
        {...props}
        title="History actions"
        onBack={() => props.navigate('/')}
        primaryActions={[
          {
            label: 'Contact us',
            onClick: () => props.navigate('/support'),
          },
        ]}
      />

      <Card>
        <Table
          {...props}
          items={historyActions?.items}
          onDelete={(item) => handleDelete(item)}
          onCancel={(item) => handleCancel(item)}
        />
      </Card>

      {historyActions && (
        <Stack distribution="center">
          <Pagination
            hasPrevious={historyActions.page > 1}
            onPrevious={() => setSearchParams({ page: historyActions.page - 1 })}
            hasNext={historyActions.page < historyActions.totalPages}
            onNext={() => setSearchParams({ page: historyActions.page + 1 })}
          />
        </Stack>
      )}
    </Stack>
  )
}

export default HistoryActionsPage
