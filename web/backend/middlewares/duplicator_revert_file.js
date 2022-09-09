import DuplicatorActions from './duplicator_actions.js'
import { FileFields } from './duplicator_constants.js'

export default (shop, data) => {
  try {
    let resources = DuplicatorActions.groupData(data)

    for (let ii = 0; ii < resources.length; ii++) {
      const rows = resources[ii].rows

      /**
       * file
       */
      let file = {}
      FileFields.forEach((key) => {
        switch (key) {
          case 'id':
            break

          case 'url':
            file['originalSource'] = rows[0][key]
            break

          default:
            file[key] = rows[0][key]
            break
        }
      })

      resources[ii] = { file }
    }

    return resources
  } catch (error) {
    throw error
  }
}
