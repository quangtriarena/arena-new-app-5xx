import {
  BlogFields,
  MetafieldFields,
  ArticleFields,
  ArticleImageFields,
} from './duplicator_constants.js'
import { getFieldValue } from './duplicator_helpers.js'

export default (dataList) => {
  try {
    let rows = []

    for (let ii = 0, leng = dataList.length; ii < leng; ii++) {
      const { blog, metafields, articles, articlesImages, articlesMetafields } = dataList[ii]

      const length = Math.max(
        metafields.length ||
          articles.length ||
          articlesImages.length ||
          articlesMetafields.length ||
          1
      )

      for (let i = 0; i < length; i++) {
        let row = {}

        BlogFields.forEach((key) => {
          switch (key) {
            case 'id':
              row[key] = getFieldValue(blog[key])
              break

            default:
              row[key] = i === 0 ? getFieldValue(blog[key]) : ''
              break
          }
        })
        MetafieldFields.forEach(
          (key) => (row['metafield_' + key] = getFieldValue(metafields[i]?.[key]))
        )

        ArticleFields.forEach((key) => (row['article_' + key] = getFieldValue(articles[i]?.[key])))
        ArticleImageFields.forEach(
          (key) => (row['article_image_' + key] = getFieldValue(articlesImages[i]?.[key]))
        )
        MetafieldFields.forEach(
          (key) => (row['article_metafield_' + key] = getFieldValue(articlesMetafields[i]?.[key]))
        )

        rows.push(row)
      }
    }

    return rows
  } catch (error) {
    throw error
  }
}
