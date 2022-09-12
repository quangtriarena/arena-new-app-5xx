import verifyToken from '../auth/verifyToken.js'
import graphqlCaller from '../helpers/graphqlCaller.js'
import ResponseHandler from '../helpers/responseHandler.js'
import ArticleMiddleware from '../middlewares/article.js'
import BlogMiddleware from '../middlewares/blog.js'
import BullmqJobMiddleware from '../middlewares/bullmq_job.js'
import CustomerMiddleware from '../middlewares/customer.js'
import CustomCollectionMiddleware from '../middlewares/custom_collection.js'
import DuplicatorActions from '../middlewares/duplicator_actions.js'
import DuplicatorPackageMiddleware from '../middlewares/duplicator_package.js'
import GraphqlFileMiddleware from '../middlewares/graphql_file.js'
import GraphqlProductMiddleware from '../middlewares/graphql_product.js'
import HistoryActionMiddleware from '../middlewares/history_action.js'
import PageMiddleware from '../middlewares/page.js'
import ProductMiddleware from '../middlewares/product.js'
import ShopMiddleware from '../middlewares/shop.js'
import SmartCollectionMiddleware from '../middlewares/smart_collection.js'
import StoreSettingMiddleware from '../middlewares/store_setting.js'
import csvtojson from 'csvtojson'
import ProductVariantMiddleware from '../middlewares/product_variant.js'
import ProductImageMiddleware from '../middlewares/product_image.js'
import themeKit from '@shopify/themekit'
import path from 'path'
import fs from 'fs'
import CollectionMiddleware from '../middlewares/collection.js'
import MetafieldMiddleware from '../middlewares/metafield.js'

const clearResources = async (req, res) => {
  const session = await verifyToken(req, res)
  const { shop, accessToken } = session

  console.log(`Delete custom collection:`)
  let custom_collections = await CustomCollectionMiddleware.getAll({ shop, accessToken })
  if (custom_collections.length) {
    for (let i = 0, leng = custom_collections.length; i < leng; i++) {
      await CustomCollectionMiddleware.delete({
        shop,
        accessToken,
        id: custom_collections[i].id,
      })
        .then((res) => console.log(`\t [${i + 1}/${leng}] custom_collection deleted`))
        .catch((err) =>
          console.log(`\t [${i + 1}/${leng}] delete custom_collection failed: ${err.message}`)
        )
    }
  } else {
    console.log(`\t Custom collections is empty`)
  }

  console.log(`Delete smart collection:`)
  let smart_collections = await SmartCollectionMiddleware.getAll({ shop, accessToken })
  if (smart_collections.length) {
    for (let i = 0, leng = smart_collections.length; i < leng; i++) {
      await SmartCollectionMiddleware.delete({ shop, accessToken, id: smart_collections[i].id })
        .then((res) => console.log(`\t [${i + 1}/${leng}] smart_collection deleted`))
        .catch((err) =>
          console.log(`\t [${i + 1}/${leng}] delete smart_collection failed: ${err.message}`)
        )
    }
  } else {
    console.log(`\t Smart collections is empty`)
  }

  console.log(`Delete product:`)
  let products = await ProductMiddleware.getAll({ shop, accessToken })
  if (products.length) {
    for (let i = 0, leng = products.length; i < leng; i++) {
      await ProductMiddleware.delete({ shop, accessToken, id: products[i].id })
        .then((res) => console.log(`\t [${i + 1}/${leng}] product deleted`))
        .catch((err) => console.log(`\t [${i + 1}/${leng}] delete product failed: ${err.message}`))
    }
  } else {
    console.log(`\t Products is empty`)
  }

  console.log(`Delete pages:`)
  let pages = await PageMiddleware.getAll({ shop, accessToken })
  if (pages.length) {
    for (let i = 0, leng = pages.length; i < leng; i++) {
      await PageMiddleware.delete({ shop, accessToken, id: pages[i].id })
        .then((res) => console.log(`\t [${i + 1}/${leng}] page deleted`))
        .catch((err) => console.log(`\t [${i + 1}/${leng}] delete page failed: ${err.message}`))
    }
  } else {
    console.log(`\t Pages is empty`)
  }

  console.log(`Delete blogs:`)
  let blogs = await BlogMiddleware.getAll({ shop, accessToken })
  if (blogs.length) {
    for (let i = 0, leng = blogs.length; i < leng; i++) {
      await BlogMiddleware.delete({ shop, accessToken, id: blogs[i].id })
        .then((res) => console.log(`\t [${i + 1}/${leng}] blog deleted`))
        .catch((err) => console.log(`\t [${i + 1}/${leng}] delete blog failed: ${err.message}`))
    }
  } else {
    console.log(`\t Blogs is empty`)
  }
}

const testMiddleware = async (req, res) => {
  const session = await verifyToken(req, res)
  const { shop, accessToken } = session

  let data = null

  let count = null,
    items = null,
    entry = null,
    created = null,
    updated = null,
    deleted = null,
    all = null

  entry = await CollectionMiddleware.findById({ shop, accessToken, id: '409488392417' })
  items = await CollectionMiddleware.getProducts({
    shop,
    accessToken,
    id: '409488392417',
    limit: 2,
  })
  all = await CollectionMiddleware.getAllProducts({ shop, accessToken, id: '409488392417' })

  data = {
    count,
    items,
    entry,
    created,
    updated,
    deleted,
    all,
  }

  return data
}

const test = async ({ shop, accessToken, type, count }) => {
  console.log('\ntest')

  let resources = null,
    exportData = null,
    convertedData = null,
    csvContent = null,
    jsonData = null,
    revertedData = null,
    importedData = null

  resources = await DuplicatorActions.getResources({ shop, accessToken, type, count })
  exportData = await DuplicatorActions.getExportData({
    shop,
    accessToken,
    type,
    resources,
  })
  convertedData = DuplicatorActions.convertData(type, exportData)
  csvContent = DuplicatorActions.createCSV(convertedData)
  jsonData = await csvtojson().fromString(csvContent)
  revertedData = DuplicatorActions.revertData(type, shop, jsonData)
  importedData = await DuplicatorActions.createData({
    shop,
    accessToken,
    type,
    resources: revertedData,
  })

  return {
    resources,
    exportData,
    convertedData,
    csvContent,
    jsonData,
    revertedData,
    importedData,
  }
}

const testThemeKit = async ({ shop, accessToken }) => {
  let cwd = path.join(process.cwd(), 'temp', shop.replace('.myshopify.com', ''))

  try {
    await fs.mkdirSync(dir)
  } catch (error) {}

  let config = `development:
    password: '${accessToken}'
    theme_id: '134439469281'
    store: ${shop}
  production:
    password: '${accessToken}'
    theme_id: '134439403745'
    store: ${shop}`

  try {
    await fs.writeFileSync(
      path.join(process.cwd(), 'temp', shop.replace('.myshopify.com', ''), 'config.yml'),
      config,
      'utf8'
    )
  } catch (error) {}

  data = await themeKit.command(
    'download',
    {
      env: 'development',
    },
    {
      cwd,
      logLevel: 'all',
    }
  )
}

export default {
  submit: async (req, res) => {
    console.log('----------------------------------------')
    console.log('/api/submition')
    console.log('----------------------------------------')
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let data = null

      // data = await testMiddleware(req, res)

      // data = await test({
      //   shop,
      //   accessToken,
      //   // type: 'product',
      //   // type: 'custom_collection',
      //   // type: 'smart_collection',
      //   // type: 'page',
      //   type: 'blog_post',
      //   count: '1',
      // })

      // data = await BullmqJobMiddleware.create('duplicator_export', {
      //   shop,
      //   name: 'test',
      //   description: 'test',
      //   note: 'default',
      //   resources: [
      //     {
      //       type: 'product',
      //       count: '5',
      //     },
      //     {
      //       type: 'custom_collection',
      //       count: '5',
      //     },
      //     {
      //       type: 'smart_collection',
      //       count: '5',
      //     },
      //     {
      //       type: 'page',
      //       count: '5',
      //     },
      //     {
      //       type: 'blog_post',
      //       count: '5',
      //     },
      //   ],
      //   duplicatorPackageId: 1,
      // })

      // data = await BullmqJobMiddleware.create('duplicator_import', {
      //   shop,
      //   uuid: 'cca651ca-afba-4459-ba8f-2490defbb193',
      //   duplicatorPackageId: 1,
      //   logId: 1662629531182,
      // })

      // console.log('/api/submition data :>> ', data)

      return ResponseHandler.success(res, data)
    } catch (error) {
      console.log('/api/submition error :>> ', error.message)
      return ResponseHandler.error(res, error)
    }
  },
}
