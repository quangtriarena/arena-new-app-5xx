import DuplicatorActions from './duplicator_actions.js'
import {
  SmartCollectionFields,
  SmartCollectionRuleFields,
  CollectionImageFields,
  MetafieldFields,
} from './duplicator_constants.js'

export default (shop, data) => {
  try {
    let resources = DuplicatorActions.groupData(data)

    for (let ii = 0; ii < resources.length; ii++) {
      const { id, rows } = resources[ii]

      /**
       * smart collection
       */
      let smart_collection = {}
      SmartCollectionFields.forEach((key) => {
        switch (key) {
          case 'disjunctive':
            smart_collection[key] = Boolean(rows[0][key] === true || rows[0][key] === 'true')
            break

          default:
            smart_collection[key] = rows[0][key]
            break
        }
      })

      /**
       * image
       */
      let image = {}
      CollectionImageFields.forEach((key) => (image[key] = rows[0]['image_' + key]))

      if (image.src) {
        smart_collection.image = image
      }

      /**
       * rules
       */
      let rules = rows
        .map((row) => {
          let obj = {}
          SmartCollectionRuleFields.forEach((key) => (obj[key] = row['rule_' + key]))
          return obj
        })
        .filter((item) => item.column)

      smart_collection.rules = rules

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

      smart_collection.metafields = metafields
      metafields.push({
        key: 'origin',
        value: JSON.stringify({ shop, id }),
        type: 'json',
        namespace: 'arena_duplicator',
      })

      resources[ii] = { smart_collection }
    }

    return resources
  } catch (error) {
    throw error
  }
}
