import PropTypes from 'prop-types'
import { Button, Card, DisplayText, Select, Stack, TextField } from '@shopify/polaris'
import { useState } from 'react'
import DuplicatorPackageApi from '../../apis/duplicator_package'
import FormValidate from '../../helpers/formValidate'
import FormControl from '../../components/FormControl'
import { useEffect } from 'react'

DuplicatoreStore.propTypes = {
  // ...appProps
}

const initFormData = {
  uuid: {
    type: 'text',
    label: 'Add your duplicator store by unique code',
    placeholder: 'xxxx-xxxx-xxxx-xxxx-xxxx',
    value: '',
    error: '',
    required: false,
    validate: {
      trim: true,
      required: [true, 'Required!'],
      minlength: [10, 'Too short!'],
      maxlength: [100, 'Too long!'],
    },
    clearButton: true,
  },
}

function DuplicatoreStore(props) {
  const { actions, storeSetting } = props

  const [formData, setFormData] = useState(initFormData)

  const handleChange = (name, value) => {
    let _formData = JSON.parse(JSON.stringify(formData))
    _formData[name] = { ..._formData[name], value, error: '' }
    setFormData(_formData)
  }

  const handleSubmit = async () => {
    try {
      const { valid, data } = FormValidate.validateForm(formData)

      if (!valid) {
        setFormData(data)
        throw new Error('Invalid form data')
      }

      actions.showAppLoading()

      let res = await DuplicatorPackageApi.checkCode({ uuid: data['uuid'].value })
      if (!res.success) throw res.error

      actions.setStoreSetting(res.data)

      actions.showNotify({ message: 'Added' })

      setFormData(initFormData)
    } catch (error) {
      actions.showNotify({ message: error.message, error: true })

      // update error
      let _formData = JSON.parse(JSON.stringify(formData))
      _formData['uuid'] = { ..._formData['uuid'], error: error.message }
      setFormData(_formData)
    } finally {
      actions.hideAppLoading()
    }
  }

  return (
    <Card>
      <Card.Section>
        <Stack distribution="center">
          <DisplayText size="small">{formData['uuid'].label}</DisplayText>
        </Stack>
      </Card.Section>
      <Card.Section>
        <Stack>
          <Stack.Item fill>
            <FormControl
              {...formData['uuid']}
              label=""
              onChange={(value) => handleChange('uuid', value)}
            />
          </Stack.Item>
          <Button
            primary={Boolean(formData['uuid'].value)}
            disabled={!Boolean(formData['uuid'].value)}
            onClick={handleSubmit}
          >
            Add Store
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

export default DuplicatoreStore
