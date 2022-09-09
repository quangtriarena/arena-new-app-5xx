import { Stack, Button } from '@shopify/polaris'
import { useEffect, useState } from 'react'
import AppHeader from '../../components/AppHeader'
import CreateForm from './CreateForm'
import DuplicatorPackageApi from '../../apis/duplicator_package'
import MySkeletonPage from '../../components/MySkeletonPage'

function DetailPage(props) {
  const { actions, storeSetting } = props

  const id = props.location.pathname.split('/')[props.location.pathname.split('/').length - 1]

  const [created, setCreated] = useState(null)

  useEffect(() => console.log('created :>> ', created), [created])

  const getDuplicatorPackage = async (id, uuid) => {
    try {
      let res = await DuplicatorPackageApi.findById(id, `?uuid=${uuid}`)
      if (!res.success) throw res.error

      setCreated(res.data)
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })
    }
  }

  useEffect(() => {
    getDuplicatorPackage(id, storeSetting.uuid)
  }, [])

  return (
    <Stack vertical alignment="fill">
      <AppHeader
        {...props}
        title={created?.name}
        onBack={() => props.navigate('/export')}
        primaryActions={[
          {
            label: 'Contact us',
            onClick: () => props.navigate('/support'),
          },
        ]}
      />

      {created ? (
        <CreateForm {...props} created={created} onDiscard={() => props.navigate('/export')} />
      ) : (
        <MySkeletonPage />
      )}
    </Stack>
  )
}

export default DetailPage
