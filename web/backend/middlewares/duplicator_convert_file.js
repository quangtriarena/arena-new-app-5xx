import { FileFields } from './duplicator_constants.js'
import { getFieldValue } from './duplicator_helpers.js'

export default (dataList) => {
  try {
    let rows = []

    for (let ii = 0, leng = dataList.length; ii < leng; ii++) {
      const { file } = dataList[ii]

      const length = 1

      for (let i = 0; i < length; i++) {
        let row = {}

        FileFields.forEach((key) => {
          switch (key) {
            case 'id':
              row[key] = getFieldValue(file[key])
              break

            case 'url':
              row[key] = file.image?.originalSrc || file[key] || ''
              break

            case 'contentType':
              row[key] = file.id.includes('GenericFile') ? 'FILE' : 'IMAGE'
              break

            default:
              row[key] = i === 0 ? getFieldValue(file[key]) : ''
              break
          }
        })

        rows.push(row)
      }
    }

    return rows
  } catch (error) {
    throw error
  }
}
