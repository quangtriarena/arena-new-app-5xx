import SmartCollectionMiddleware from './smart_collection.js'
import MetafieldMiddleware from './metafield.js'

export default async ({ shop, accessToken, data }) => {
  const { smart_collection } = data

  try {
    /**
     * create smart collection
     */
    let collectionCreated = { ...smart_collection }

    delete collectionCreated.id
    delete collectionCreated.metafields

    collectionCreated = await SmartCollectionMiddleware.create({
      shop,
      accessToken,
      data: { smart_collection: collectionCreated },
    })
      .then((res) => {
        console.log(`\t\t\t smart collection created ${res.smart_collection.id}`)
        return res.smart_collection
      })
      .catch((err) => {
        console.log(`\t\t\t create smart collection failed: ${err.message}`)
        throw err
      })

    /**
     * create metafields
     */
    for (let i = 0, leng = smart_collection.metafields.length; i < leng; i++) {
      let metafield = { ...smart_collection.metafields[i] }
      delete metafield.id
      delete metafield.owner_id
      delete metafield.owner_resource

      await MetafieldMiddleware.create({
        shop,
        accessToken,
        resource: `smart_collections/${collectionCreated.id}/`,
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
    return { success: false, message: error.message, handle: smart_collection.handle }
  }
}
