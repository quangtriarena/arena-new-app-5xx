import MetafieldMiddleware from './metafield.js'
import ProductMiddleware from './product.js'
import ProductImageMiddleware from './product_image.js'
import ProductVariantMiddleware from './product_variant.js'

export default async ({ shop, accessToken, data }) => {
  const { product, variants, images } = data

  try {
    /**
     * create product
     */
    let productCreated = { ...product }
    productCreated.variants = variants.map((item) => {
      let obj = { ...item }
      delete obj.id
      delete obj.image_id
      delete obj.inventory_item_id
      delete obj.product_id
      delete obj.metafields
      return obj
    })
    delete productCreated.id
    delete productCreated.metafields

    productCreated = await ProductMiddleware.create({
      shop,
      accessToken,
      data: { product: productCreated },
    })
      .then((res) => {
        console.log(`\t\t\t product created ${res.product.id}`)
        return res.product
      })
      .catch((err) => {
        console.log(`\t\t\t create product failed: ${err.message}`)
        throw err
      })

    /**
     * create metafields
     */
    for (let i = 0, leng = product.metafields.length; i < leng; i++) {
      let metafield = { ...product.metafields[i] }
      delete metafield.id
      delete metafield.owner_id
      delete metafield.owner_resource

      await MetafieldMiddleware.create({
        shop,
        accessToken,
        resource: `products/${productCreated.id}/`,
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
     * create variants metafields
     */
    for (let i = 0, leng = variants.length; i < leng; i++) {
      let originVariant = variants[i]
      let newVariant = productCreated.variants.find(
        (item) =>
          (item.option1 ? item.option1 === originVariant.option1 : true) &&
          (item.option2 ? item.option2 === originVariant.option2 : true) &&
          (item.option3 ? item.option3 === originVariant.option3 : true)
      )
      if (newVariant) {
        for (let j = 0, jleng = originVariant.metafields.length; j < jleng; j++) {
          let metafield = { ...originVariant.metafields[j] }
          delete metafield.id
          delete metafield.owner_id
          delete metafield.owner_resource

          await MetafieldMiddleware.create({
            shop,
            accessToken,
            resource: `variants/${newVariant.id}/`,
            data: { metafield },
          })
            .then((res) => {
              console.log(`\t\t\t variant metafield created ${res.metafield.id}`)
            })
            .catch((err) => {
              console.log(`\t\t\t create variant metafield failed: ${err.message}`)
            })
        }
      }
    }

    /**
     * create images
     */
    for (let i = 0, leng = images.length; i < leng; i++) {
      let image = { ...images[i] }
      image.variant_ids = image.variant_ids.map((item) => {
        let originVariant = variants.find((_item) => _item.id == item)
        let newVariant = productCreated.variants.find(
          (_item) =>
            (_item.option1 ? _item.option1 === originVariant.option1 : true) &&
            (_item.option2 ? _item.option2 === originVariant.option2 : true) &&
            (_item.option3 ? _item.option3 === originVariant.option3 : true)
        )
        return newVariant.id
      })
      delete image.id
      delete image.metafields

      await ProductImageMiddleware.create({
        shop,
        accessToken,
        product_id: productCreated.id,
        data: { image },
      })
        .then(async (res) => {
          console.log(`\t\t\t image created ${res.image.id}`)

          for (let j = 0, jleng = images[i].metafields.length; j < jleng; j++) {
            let metafield = { ...images[i].metafields[j] }
            delete metafield.id
            delete metafield.owner_id
            delete metafield.owner_resource

            await MetafieldMiddleware.create({
              shop,
              accessToken,
              resource: `product_images/${res.image.id}/`,
              data: { metafield },
            })
              .then((res) => {
                console.log(`\t\t\t\t image metafield created ${res.metafield.id}`)
              })
              .catch((err) => {
                console.log(`\t\t\t\t create variant metafield failed: ${err.message}`)
              })
          }
        })
        .catch((err) => {
          console.log(`\t\t\t create image failed: ${err.message}`)
        })
    }

    return { success: true, id: productCreated.id, handle: productCreated.handle }
  } catch (error) {
    return { success: false, message: error.message, handle: product.handle }
  }
}
