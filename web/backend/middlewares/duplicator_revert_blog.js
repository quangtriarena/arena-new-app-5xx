import DuplicatorActions from './duplicator_actions.js'
import {
  ArticleFields,
  ArticleImageFields,
  BlogFields,
  MetafieldFields,
} from './duplicator_constants.js'

export default (shop, data) => {
  try {
    let resources = DuplicatorActions.groupData(data)

    for (let ii = 0; ii < resources.length; ii++) {
      const { id, rows } = resources[ii]

      /**
       * articles metafields
       */
      let articlesMetafields = rows
        .map((row) => {
          let obj = {}
          MetafieldFields.forEach((key) => (obj[key] = row['article_metafield_' + key]))
          return obj
        })
        .filter((item) => item.id)

      /**
       * articles images
       */
      let articlesImages = rows
        .map((row) => {
          let obj = {}
          ArticleImageFields.forEach((key) => (obj[key] = row['article_image_' + key]))
          return obj
        })
        .filter((item) => item.src)

      /**
       * articles
       */
      let articles = rows
        .map((row) => {
          let obj = {}
          ArticleFields.forEach((key) => (obj[key] = row['article_' + key]))

          obj.image = articlesImages.find((item) => item['owner_id'] === obj.id)

          obj.metafields = articlesMetafields.filter((item) => item['owner_id'] === obj.id)
          obj.metafields.push({
            key: 'origin',
            value: JSON.stringify({ shop, id: obj.id }),
            type: 'json',
            namespace: 'arena_duplicator',
          })

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
       * blog
       */
      let blog = {}
      BlogFields.forEach((key) => (blog[key] = rows[0][key]))

      blog.metafields = metafields
      blog.metafields.push({
        key: 'origin',
        value: JSON.stringify({ shop, id }),
        type: 'json',
        namespace: 'arena_duplicator',
      })

      resources[ii] = { blog, articles }
    }

    return resources
  } catch (error) {
    throw error
  }
}
