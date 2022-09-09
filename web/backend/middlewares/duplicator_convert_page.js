import { MetafieldFields, PageFields } from './duplicator_constants.js'
import { getFieldValue } from './duplicator_helpers.js'

export default (dataList) => {
  try {
    let rows = []

    for (let ii = 0, leng = dataList.length; ii < leng; ii++) {
      const { page, metafields } = dataList[ii]

      const length = Math.max(metafields.length || 1)

      for (let i = 0; i < length; i++) {
        let row = {}

        PageFields.forEach((key) => {
          switch (key) {
            case 'id':
              row[key] = getFieldValue(page[key])
              break

            default:
              row[key] = i === 0 ? getFieldValue(page[key]) : ''
              break
          }
        })
        MetafieldFields.forEach(
          (key) => (row['metafield_' + key] = getFieldValue(metafields[i]?.[key]))
        )

        rows.push(row)
      }
    }

    return rows
  } catch (error) {
    throw error
  }
}
