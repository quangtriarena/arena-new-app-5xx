import ArticleMiddleware from './article.js'
import BlogMiddleware from './blog.js'
import MetafieldMiddleware from './metafield.js'

export default async ({ shop, accessToken, id }) => {
  try {
    /**
     * get blog
     */
    let blog = await BlogMiddleware.findById({
      shop,
      accessToken,
      id,
    })
    blog = blog.blog
    console.log(`\t\t\t blog ${blog.id}`)

    /**
     * get metafields
     */
    let metafields = await MetafieldMiddleware.getAll({
      shop,
      accessToken,
      resource: `blogs/${id}/`,
    })
    console.log(`\t\t\t total metafields ${metafields.length}`)

    /**
     * get articles
     */
    let articles = await ArticleMiddleware.getAll({
      shop,
      accessToken,
      blog_id: id,
    })
    console.log(`\t\t\t total articles ${articles.length}`)

    /**
     * get articles images
     */
    let articlesImages = []
    articles.forEach((item) =>
      item.image ? articlesImages.push({ ...item.image, owner_id: item.id }) : null
    )
    console.log(`\t\t\t total articles images ${articlesImages.length}`)

    articles = articles.map((item) => {
      let obj = { ...item }
      delete obj.image
      return obj
    })

    /**
     * get articles metafields
     */
    let articlesMetafields = []
    for (let i = 0; i < articles.length; i++) {
      let _metafields = await MetafieldMiddleware.getAll({
        shop,
        accessToken,
        resource: `blogs/${id}/articles/${articles[i].id}/`,
      })

      articlesMetafields = articlesMetafields.concat(_metafields)
    }
    console.log(`\t\t\t total articles metafields ${articlesMetafields.length}`)

    return {
      blog,
      metafields,
      articles,
      articlesImages,
      articlesMetafields,
    }
  } catch (error) {
    throw error
  }
}
