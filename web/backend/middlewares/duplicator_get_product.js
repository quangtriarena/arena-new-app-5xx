import MetafieldMiddleware from './metafield.js'
import ProductMiddleware from './product.js'
import ProductImageMiddleware from './product_image.js'
import ProductVariantMiddleware from './product_variant.js'

export default async ({ shop, accessToken, id }) => {
  try {
    /**
     * get product
     */
    let product = await ProductMiddleware.findById({
      shop,
      accessToken,
      id,
    })
    product = product.product
    console.log(`\t\t\t product ${product.id}`)

    /**
     * get variants
     */
    let variants = product.variants
    console.log(`\t\t\t total variants ${variants.length}`)

    /**
     * get images
     */
    let images = product.images
    console.log(`\t\t\t total images ${images.length}`)

    delete product.variants
    delete product.images
    delete product.image

    /**
     * get metafields
     */
    let metafields = await MetafieldMiddleware.getAll({
      shop,
      accessToken,
      resource: `products/${product.id}/`,
    })
    console.log(`\t\t\t total metafields ${metafields.length}`)

    /**
     * get variants metafields
     */
    let variantsMetafields = []
    for (let i = 0, leng = variants.length; i < leng; i++) {
      let _metafields = await MetafieldMiddleware.getAll({
        shop,
        accessToken,
        resource: `variants/${variants[i].id}/`,
      })

      variantsMetafields = variantsMetafields.concat(_metafields)
    }
    console.log(`\t\t\t total variants metafields ${variantsMetafields.length}`)

    /**
     * get images metafields
     */
    let imagesMetafields = []
    for (let i = 0, leng = images.length; i < leng; i++) {
      let _metafields = await MetafieldMiddleware.getAll({
        shop,
        accessToken,
        resource: `product_images/${images[i].id}/`,
      })

      imagesMetafields = imagesMetafields.concat(_metafields)
    }
    console.log(`\t\t\t total images metafields ${imagesMetafields.length}`)

    return {
      product,
      metafields,
      variants,
      variantsMetafields,
      images,
      imagesMetafields,
    }
  } catch (error) {
    throw error
  }
}
