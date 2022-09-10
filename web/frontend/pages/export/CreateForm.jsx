import PropTypes from 'prop-types'
import { Button, Card, DisplayText, Stack, TextField } from '@shopify/polaris'
import { useEffect, useState, version } from 'react'
import FormValidate from '../../helpers/formValidate'
import FormControl from '../../components/FormControl'
import ResourceItem from './ResourceItem'
import DuplicatorPackageApi from '../../apis/duplicator_package'
import { generateExportDescriptions, generateExportName } from './actions'

CreateForm.propTypes = {
  // ...appProps,
  created: PropTypes.object,
  onDiscard: PropTypes.func,
}

CreateForm.defaultProps = {
  created: {},
  onDiscard: () => null,
}

const Resources = [
  'product',
  'custom_collection',
  'smart_collection',
  'page',
  'blog_post',
  // 'file',
  // 'shop',
  // 'customer',
  // 'discount_code',
  // 'draft_order',
  // 'order',
  // 'redirect',
]

const ResourceFormData = {
  type: { value: '' },
  count: {
    type: 'select',
    label: 'Count',
    placeholder: '',
    value: '10',
    error: '',
    required: true,
    validate: {},
    options: [
      { label: '5 (test)', value: '5' },
      { label: '10', value: '10' },
      { label: '50', value: '50' },
      { label: '100', value: '100' },
      { label: '500', value: '500' },
      { label: '1000', value: '1000' },
      { label: 'All', value: 'all' },
    ],
  },
  columns: { value: null },
  filter: { value: null },
}

const ResourceListFormData = Resources.map((item) => ({
  ...ResourceFormData,
  type: { value: item },
}))

const initFormData = {
  name: {
    type: 'text',
    label: 'Name',
    placeholder: 'name',
    value: '',
    error: '',
    required: true,
    validate: {
      trim: true,
      required: [true, 'Required!'],
      minlength: [1, 'Too short!'],
      maxlength: [100, 'Too long!'],
    },
  },
  description: {
    type: 'text',
    label: 'Description',
    placeholder: 'description',
    value: '',
    error: '',
    required: true,
    validate: {
      trim: true,
      required: [true, 'Required!'],
      minlength: [1, 'Too short!'],
      maxlength: [200, 'Too long!'],
    },
    multiline: 4,
  },
  resourceTypes: {
    type: 'multiple-select',
    label: 'Select resources',
    placeholder: '',
    value: [...Resources],
    error: '',
    required: false,
    validate: {},
    options: Resources.map((item) => ({
      label: item[0].toUpperCase() + item.slice(1).replace(/_/g, ' ').toLowerCase() + 's',
      value: item,
    })),
  },
  resources: Resources.map((item) => ({
    ...ResourceFormData,
    type: { ...ResourceFormData.type, value: item },
  })),
  schedule: {
    type: 'select',
    label: 'Schedule',
    placeholder: '',
    value: 'one-time',
    error: '',
    required: true,
    validate: {},
    options: [
      { label: 'One time', value: 'one-time' },
      { label: 'Every 6 hours', value: 'every-6-hours' },
      { label: 'Every 12 hours', value: 'every-12-hours' },
      { label: 'Every day', value: 'every-day' },
      { label: 'Every week', value: 'every-week' },
      { label: 'Every month', value: 'every-month' },
    ],
    disabled: true,
  },
}

function CreateForm(props) {
  const { actions, created, onDiscard, versions } = props

  const [formData, setFormData] = useState(null)

  useEffect(() => console.log('formData :>> ', formData), [formData])

  const handleChange = (name, value) => {
    let _formData = JSON.parse(JSON.stringify(formData))
    _formData[name] = { ..._formData[name], value, error: '' }
    setFormData(_formData)
  }

  useEffect(() => {
    let _formData = JSON.parse(JSON.stringify(initFormData))

    if (created.id) {
      _formData.name.value = created.name
      _formData.description.value = created.description
      _formData.resourceTypes.value = created.resources.map((item) => item.type)
      _formData.resources = created.resources.map((item) => ({
        ...ResourceFormData,
        type: { ...ResourceFormData.type, value: item.type },
        count: { ...ResourceFormData.count, value: item.count },
      }))
    }

    setFormData(_formData)
  }, [])

  const handleSubmit = async (type) => {
    try {
      let _formData = JSON.parse(JSON.stringify(formData))

      let validFormData = {
        name: formData.name,
        description: formData.description,
      }
      const { valid, data } = FormValidate.validateForm(validFormData)

      _formData = { ..._formData, ...data }

      if (!valid) {
        setFormData(_formData)
        throw new Error('Invalid form data')
      }

      let _data = {
        name: _formData.name.value,
        description: _formData.description.value,
        resources: _formData.resources.map((item) => {
          let obj = {}
          Object.keys(item).forEach((key) =>
            item[key].value ? (obj[key] = item[key].value) : null
          )
          return obj
        }),
      }

      actions.showAppLoading()

      switch (type) {
        case 'save_only':
          _data.resources = JSON.stringify(_data.resources)

          await DuplicatorPackageApi.update(created.id, _data)

          actions.showNotify({ message: 'Saved' })
          break

        default:
          // submit
          if (created.id) {
            _data.duplicatorPackageId = created.id
          }

          let res = await DuplicatorPackageApi.export(_data)
          if (!res.success) throw res.error

          actions.showNotify({ message: 'Process is running in background. Waiting for finnish.' })
          props.navigate('/history-actions')
          break
      }
    } catch (error) {
      actions.showNotify({ error: true, message: error.message })
    } finally {
      actions.hideAppLoading()
    }
  }

  if (!formData) {
    return null
  }

  return (
    <Stack vertical>
      <Card title="Export Package">
        <Card.Section subdued>
          <Stack distribution="fillEvenly">
            <FormControl {...formData['name']} onChange={(value) => handleChange('name', value)} />
            <FormControl
              {...formData['description']}
              onChange={(value) => handleChange('description', value)}
            />
          </Stack>
        </Card.Section>
      </Card>

      <Card title="Customize Resources">
        <Card.Section subdued>
          <Stack vertical>
            <FormControl
              {...formData['resourceTypes']}
              onChange={(value) => {
                let _formData = JSON.parse(JSON.stringify(formData))
                _formData['resourceTypes'] = { ..._formData['resourceTypes'], value, error: '' }
                _formData.resources = value.map((item) => ({
                  ...ResourceFormData,
                  type: { ...ResourceFormData.type, value: item },
                }))

                _formData.name = {
                  ..._formData.name,
                  value: _formData.name.value
                    ? _formData.name.value
                    : generateExportName(_formData.resources),
                  error: '',
                }
                _formData.description = {
                  ..._formData.description,
                  value: generateExportDescriptions(_formData.resources),
                  error: '',
                }

                setFormData(_formData)
              }}
            />

            {formData['resources'].length > 0 && (
              <Stack vertical alignment="fill">
                {formData.resources.map((item, index) => (
                  <ResourceItem
                    key={index}
                    formData={item}
                    onChange={(value) => {
                      let _formData = JSON.parse(JSON.stringify(formData))
                      let _value = JSON.parse(JSON.stringify(value))
                      _formData.resources[index] = _value

                      _formData.name = {
                        ..._formData.name,
                        value: _formData.name.value
                          ? _formData.name.value
                          : generateExportName(_formData.resources),
                        error: '',
                      }
                      _formData.description = {
                        ..._formData.description,
                        value: generateExportDescriptions(_formData.resources),
                        error: '',
                      }

                      setFormData(_formData)
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Card.Section>
      </Card>

      <Card title="Optional">
        <Card.Section subdued>
          <Stack distribution="fillEvenly">
            <Stack.Item fill>
              <FormControl
                {...formData['schedule']}
                onChange={(value) => handleChange('schedule', value)}
              />
            </Stack.Item>
            <Stack.Item fill></Stack.Item>
          </Stack>
        </Card.Section>
      </Card>

      <Stack distribution="trailing">
        <Button onClick={onDiscard} disabled={props.appLoading.loading}>
          <div style={{ minWidth: 80, textAlign: 'center' }}>Discard</div>
        </Button>
        {created.id && (
          <Button
            primary
            onClick={() => handleSubmit('save_only')}
            disabled={props.appLoading.loading}
          >
            <div style={{ minWidth: 80, textAlign: 'center' }}>Save only</div>
          </Button>
        )}
        <Button primary onClick={() => handleSubmit()} disabled={props.appLoading.loading}>
          <div style={{ minWidth: 80, textAlign: 'center' }}>Export now</div>
        </Button>
      </Stack>
    </Stack>
  )
}

export default CreateForm
