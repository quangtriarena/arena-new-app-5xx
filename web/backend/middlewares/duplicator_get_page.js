import MetafieldMiddleware from './metafield.js'
import PageMiddleware from './page.js'

export default async ({ shop, accessToken, id }) => {
  try {
    /**
     * get page
     */
    let page = await PageMiddleware.findById({
      shop,
      accessToken,
      id,
    })
    page = page.page
    console.log(`\t\t\t page ${page.id}`)

    /**
     * get metafields
     */
    let metafields = await MetafieldMiddleware.getAll({
      shop,
      accessToken,
      resource: `pages/${id}/`,
    })
    console.log(`\t\t\t total metafields ${metafields.length}`)

    return {
      page,
      metafields,
    }
  } catch (error) {
    throw error
  }
}
