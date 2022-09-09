import {
  ProductFields,
  MetafieldFields,
  VariantFields,
  ProductImageFields,
} from './duplicator_constants.js'
import { getFieldValue } from './duplicator_helpers.js'

export default (dataList) => {
  try {
    let rows = []

    for (let ii = 0, leng = dataList.length; ii < leng; ii++) {
      const { product, metafields, variants, variantsMetafields, images, imagesMetafields } =
        dataList[ii]

      const length = Math.max(
        metafields.length,
        variants.length,
        variantsMetafields.length,
        images.length,
        imagesMetafields.length,
        1
      )

      for (let i = 0; i < length; i++) {
        let row = {}

        ProductFields.forEach((key) => {
          switch (key) {
            case 'id':
              row[key] = getFieldValue(product[key])
              break

            case 'options':
              row[key] =
                i === 0
                  ? JSON.stringify(
                      product.options.map((item) => ({
                        position: item.position,
                        name: item.name,
                        values: item.values,
                      }))
                    )
                  : ''
              break

            default:
              row[key] = i === 0 ? getFieldValue(product[key]) : ''
              break
          }
        })
        MetafieldFields.forEach(
          (key) => (row['metafield_' + key] = getFieldValue(metafields[i]?.[key]))
        )

        VariantFields.forEach((key) => (row['variant_' + key] = getFieldValue(variants[i]?.[key])))
        MetafieldFields.forEach(
          (key) => (row['variant_metafield_' + key] = getFieldValue(variantsMetafields[i]?.[key]))
        )

        ProductImageFields.forEach((key) => {
          switch (key) {
            case 'variant_ids':
              row['image_' + key] = images[i]?.[key] ? JSON.stringify(images[i]?.[key]) : '[]'
              break

            default:
              row['image_' + key] = getFieldValue(images[i]?.[key])
              break
          }
        })
        MetafieldFields.forEach(
          (key) => (row['image_metafield_' + key] = getFieldValue(imagesMetafields[i]?.[key]))
        )

        rows.push(row)
      }
    }

    return rows
  } catch (error) {
    throw error
  }
}
