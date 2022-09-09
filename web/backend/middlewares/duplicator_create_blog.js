import ArticleMiddleware from './article.js'
import BlogMiddleware from './blog.js'
import MetafieldMiddleware from './metafield.js'

export default async ({ shop, accessToken, data }) => {
  const { blog, articles } = data

  try {
    /**
     * create blog
     */
    let blogCreated = { ...blog }

    delete blogCreated.id
    delete blogCreated.metafields

    blogCreated = await BlogMiddleware.create({
      shop,
      accessToken,
      data: { blog: blogCreated },
    })
      .then((res) => {
        console.log(`\t\t\t blog created ${res.blog.id}`)
        return res.blog
      })
      .catch((err) => {
        console.log(`\t\t\t create blog failed: ${err.message}`)
        throw err
      })

    /**
     * create metafields
     */
    for (let i = 0; i < blog.metafields.length; i++) {
      let metafield = { ...blog.metafields[i] }

      delete metafield.id
      delete metafield.owner_id
      delete metafield.owner_resource

      metafield = await MetafieldMiddleware.create({
        shop,
        accessToken,
        resource: `blogs/${blogCreated.id}/`,
        data: { metafield },
      })
        .then((res) => {
          console.log(`\t\t\t metafield created ${res.metafield.id}`)
        })
        .catch((err) => {
          console.log(`\t\t\t create metafield failed: ${err.message}`)
        })
    }

    /**
     * create articles
     */
    for (let i = 0; i < articles.length; i++) {
      let article = { ...articles[i], blog_id: blogCreated.id }

      delete article.id
      delete article.metafields

      if (article.image) {
        delete article.image.owner_id
      } else {
        delete article.image
      }

      article = await ArticleMiddleware.create({
        shop,
        accessToken,
        blog_id: blogCreated.id,
        data: { article },
      })
        .then(async (res) => {
          console.log(`\t\t\t article created ${res.article.id}`)

          /**
           * create article metafields
           */
          for (let j = 0; j < articles[i].metafields.length; j++) {
            let metafield = { ...articles[i].metafields[j] }

            delete metafield.id
            delete metafield.owner_id
            delete metafield.owner_resource

            metafield = await MetafieldMiddleware.create({
              shop,
              accessToken,
              resource: `blogs/${blogCreated.id}/articles/${res.article.id}/`,
              data: { metafield },
            })
              .then((res) => {
                console.log(`\t\t\t\t metafield created ${res.metafield.id}`)
              })
              .catch((err) => {
                console.log(`\t\t\t\t create metafield failed: ${err.message}`)
              })
          }
        })
        .catch((err) => {
          console.log(`\t\t\t create article failed: ${err.message}`)
        })
    }

    return { success: true, id: blogCreated.id, handle: blogCreated.handle }
  } catch (error) {
    return { success: false, message: error.message, handle: blog.handle }
  }
}
