import CustomCollectionMiddleware from './custom_collection.js'
import MetafieldMiddleware from './metafield.js'

export default async ({ shop, accessToken, data }) => {
  const { custom_collection } = data

  try {
    /**
     * create collection
     */
    let collectionCreated = { ...custom_collection }

    delete collectionCreated.id
    delete collectionCreated.metafields

    collectionCreated = await CustomCollectionMiddleware.create({
      shop,
      accessToken,
      data: { custom_collection: collectionCreated },
    })
      .then((res) => {
        console.log(`\t\t\t custom collection created ${res.custom_collection.id}`)
        return res.custom_collection
      })
      .catch((err) => {
        console.log(`\t\t\t create custom collection failed: ${err.message}`)
        throw err
      })

    /**
     * create metafields
     */
    for (let i = 0, leng = custom_collection.metafields.length; i < leng; i++) {
      let metafield = { ...custom_collection.metafields[i] }
      delete metafield.id
      delete metafield.owner_id
      delete metafield.owner_resource

      await MetafieldMiddleware.create({
        shop,
        accessToken,
        resource: `custom_collections/${collectionCreated.id}/`,
        data: { metafield },
      })
        .then((res) => {
          console.log(`\t\t\t metafield created ${res.metafield.id}`)
        })
        .catch((err) => {
          console.log(`\t\t\t create metafield failed: ${err.message}`)
        })
    }

    return { success: true, id: collectionCreated.id, handle: collectionCreated.handle }
  } catch (error) {
    return { success: false, message: error.message, handle: custom_collection.handle }
  }
}
