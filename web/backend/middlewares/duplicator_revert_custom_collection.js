import DuplicatorActions from './duplicator_actions.js'
import {
  CustomCollectionFields,
  CollectionImageFields,
  MetafieldFields,
} from './duplicator_constants.js'

export default (shop, data) => {
  try {
    let resources = DuplicatorActions.groupData(data)

    for (let ii = 0; ii < resources.length; ii++) {
      const { id, rows } = resources[ii]

      /**
       * custom collection
       */
      let custom_collection = {}
      CustomCollectionFields.forEach((key) => (custom_collection[key] = rows[0][key]))

      /**
       * image
       */
      let image = {}
      CollectionImageFields.forEach((key) => (image[key] = rows[0]['image_' + key]))

      if (image.src) {
        custom_collection.image = image
      }

      /**
       * products
       */
      let products = rows[0]['product_ids'] ? JSON.parse(rows[0]['product_ids']) : []

      if (products.length) {
        custom_collection.collects = products
      }

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

      custom_collection.metafields = metafields
      custom_collection.metafields.push({
        key: 'origin',
        value: JSON.stringify({ shop, id }),
        type: 'json',
        namespace: 'arena_duplicator',
      })

      resources[ii] = { custom_collection }
    }

    return resources
  } catch (error) {
    throw error
  }
}
