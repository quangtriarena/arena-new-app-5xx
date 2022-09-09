import DuplicatorActions from './duplicator_actions.js'
import {
  ProductFields,
  MetafieldFields,
  VariantFields,
  ProductImageFields,
} from './duplicator_constants.js'

export default (shop, data) => {
  try {
    let resources = DuplicatorActions.groupData(data)

    for (let ii = 0; ii < resources.length; ii++) {
      const { id, rows } = resources[ii]

      /**
       * images metafields
       */
      let imagesMetafields = rows
        .map((row) => {
          let obj = {}
          MetafieldFields.forEach((key) => (obj[key] = row['image_metafield_' + key]))
          return obj
        })
        .filter((item) => item.id)

      /**
       * variants metafields
       */
      let variantsMetafields = rows
        .map((row) => {
          let obj = {}
          MetafieldFields.forEach((key) => (obj[key] = row['variant_metafield_' + key]))
          return obj
        })
        .filter((item) => item.id)

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

      /**
       * images
       */
      let images = rows
        .map((row) => {
          let obj = {}
          ProductImageFields.forEach((key) => {
            switch (key) {
              case 'variant_ids':
                obj[key] = row['image_' + key] ? JSON.parse(row['image_' + key]) : []
                break

              default:
                obj[key] = row['image_' + key]
                break
            }
          })
          return obj
        })
        .filter((item) => item.src)
        .map((item) => {
          let obj = { ...item }

          obj.metafields = imagesMetafields.filter((_item) => _item.owner_id === item.id)
          obj.metafields.push({
            key: 'origin',
            value: JSON.stringify({ shop, id: item.id }),
            type: 'json',
            namespace: 'arena_duplicator',
          })

          return obj
        })

      /**
       * variants
       */
      let variants = rows
        .map((row) => {
          let obj = {}
          VariantFields.forEach((key) => (obj[key] = row['variant_' + key]))
          return obj
        })
        .filter((item) => item.title)
        .map((item) => {
          let obj = { ...item }

          obj.metafields = variantsMetafields.filter((_item) => _item.owner_id === item.id)
          obj.metafields.push({
            key: 'origin',
            value: JSON.stringify({ shop, id: item.id }),
            type: 'json',
            namespace: 'arena_duplicator',
          })

          return obj
        })

      /**
       * product
       */
      let product = {}
      ProductFields.forEach((key) => {
        switch (key) {
          case 'options':
            product[key] = rows[0][key] ? JSON.parse(rows[0][key]) : ''
            break

          default:
            product[key] = rows[0][key]
            break
        }
      })

      product.metafields = metafields
      product.metafields.push({
        key: 'origin',
        value: JSON.stringify({ shop, id }),
        type: 'json',
        namespace: 'arena_duplicator',
      })

      resources[ii] = {
        product,
        variants,
        images,
      }
    }

    return resources
  } catch (error) {
    throw error
  }
}
