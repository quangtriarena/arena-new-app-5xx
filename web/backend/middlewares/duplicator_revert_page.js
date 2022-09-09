import DuplicatorActions from './duplicator_actions.js'
import { MetafieldFields, PageFields } from './duplicator_constants.js'

export default (shop, data) => {
  try {
    let resources = DuplicatorActions.groupData(data)

    for (let ii = 0; ii < resources.length; ii++) {
      const { id, rows } = resources[ii]

      /**
       * page
       */
      let page = {}
      PageFields.forEach((key) => (page[key] = rows[0][key]))

      /**
       * metafields
       */
      let metafields = rows
        .map((row) => {
          let obj = {}
          MetafieldFields.forEach((key) => (obj[key] = row['metafield_' + key]))
          return obj
        })
        .filter((item) => item.id)

      page.metafields = metafields
      page.metafields.push({
        key: 'origin',
        value: JSON.stringify({ shop, id }),
        type: 'json',
        namespace: 'arena_duplicator',
      })

      resources[ii] = { page }
    }

    return resources
  } catch (error) {
    throw error
  }
}
