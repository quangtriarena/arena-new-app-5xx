import MetafieldMiddleware from './metafield.js'
import PageMiddleware from './page.js'

export default async ({ shop, accessToken, data }) => {
  const { page } = data

  try {
    /**
     * create page
     */
    let pageCreated = { ...page }

    delete pageCreated.id
    delete pageCreated.metafields

    pageCreated = await PageMiddleware.create({
      shop,
      accessToken,
      data: { page: pageCreated },
    })
      .then((res) => {
        console.log(`\t\t\t page created ${res.page.id}`)
        return res.page
      })
      .catch((err) => {
        console.log(`\t\t\t create page failed: ${err.message}`)
        throw err
      })

    /**
     * create metafields
     */
    for (let i = 0, leng = page.metafields.length; i < leng; i++) {
      let metafield = { ...page.metafields[i] }
      delete metafield.id
      delete metafield.owner_id
      delete metafield.owner_resource

      await MetafieldMiddleware.create({
        shop,
        accessToken,
        resource: `pages/${pageCreated.id}/`,
        data: { metafield },
      })
        .then((res) => {
          console.log(`\t\t\t metafield created ${res.metafield.id}`)
        })
        .catch((err) => {
          console.log(`\t\t\t create metafield failed: ${err.message}`)
        })
    }

    return { success: true, id: pageCreated.id, handle: pageCreated.handle }
  } catch (error) {
    return { success: false, message: error.message, handle: page.handle }
  }
}
