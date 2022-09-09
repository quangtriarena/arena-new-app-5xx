import { Modal } from '@shopify/polaris'
import PropTypes from 'prop-types'

ConfirmModal.propTypes = {
  title: PropTypes.string,
  content: PropTypes.any,
  onClose: PropTypes.func,
  actions: PropTypes.array,
}

ConfirmModal.defaultProps = {
  title: '',
  content: null,
  onDiscard: () => null,
  actions: [],
}

function ConfirmModal(props) {
  const { title, content, onClose, actions } = props

  return (
    <Modal open={true} onClose={onClose} title={title} secondaryActions={actions}>
      <Modal.Section>{content}</Modal.Section>
    </Modal>
  )
}

export default ConfirmModal
