import ProductMiddleware from './product.js'
import MetafieldMiddleware from './metafield.js'
import AdminZipMiddleware from './adm_zip.js'
import fs from 'fs'
import AdmZip from 'adm-zip'
import request from 'request'

import { ValidResources } from './duplicator_constants.js'

import getProduct from './duplicator_get_product.js'
import getCustomCollection from './duplicator_get_custom_collection.js'
import getSmartCollection from './duplicator_get_smart_collection.js'
import getPage from './duplicator_get_page.js'
import getBlog from './duplicator_get_blog.js'

import convertProduct from './duplicator_convert_product.js'
import convertCustomCollection from './duplicator_convert_custom_collection.js'
import convertSmartCollection from './duplicator_convert_smart_collection.js'
import convertPage from './duplicator_convert_page.js'
import convertBlog from './duplicator_convert_blog.js'
import convertFile from './duplicator_convert_file.js'

import revertProduct from './duplicator_revert_product.js'
import revertCustomCollection from './duplicator_revert_custom_collection.js'
import revertSmartCollection from './duplicator_revert_smart_collection.js'
import revertPage from './duplicator_revert_page.js'
import revertBlog from './duplicator_revert_blog.js'
import revertFile from './duplicator_revert_file.js'

import createProduct from './duplicator_create_product.js'
import createCustomCollection from './duplicator_create_custom_collection.js'
import createSmartCollection from './duplicator_create_smart_collection.js'
import createPage from './duplicator_create_page.js'
import createBlog from './duplicator_create_blog.js'
import createFile from './duplicator_create_file.js'

import csv from './duplicator_csv.js'

import cdn from './duplicator_cdn.js'
import CustomCollectionMiddleware from './custom_collection.js'
import SmartCollectionMiddleware from './smart_collection.js'
import PageMiddleware from './page.js'
import BlogMiddleware from './blog.js'
import GraphqlFileMiddleware from './graphql_file.js'

const getProductsWithOriginMetafields = async ({ shop, accessToken }) => {
  try {
    let products = []

    console.log(`\t\t get all products with origin metafield...`)
    products = await ProductMiddleware.getAll({ shop, accessToken })

    for (let i = 0, leng = products.length; i < leng; i++) {
      let metafields = await MetafieldMiddleware.getAll({
        shop,
        accessToken,
        resource: `products/${products[i].id}/`,
      })

      let originMetafield = metafields.find(
        (item) => item.key === 'origin' && item.namespace === 'arena_duplicator'
      )

      if (originMetafield) {
        let origin = JSON.parse(originMetafield.value)
        products[i] = { id: products[i].id, origin }
      } else {
        products[i] = null
      }
    }

    products = products.filter((item) => item)
    console.log(`\t\t total products has origin metafield ${products.length}`)

    return products
  } catch (error) {
    console.log('getProductsWithOriginMetafields error :>> ', error)
    throw error
  }
}

const getResources = async ({ shop, accessToken, type, count }) => {
  try {
    switch (type) {
      case 'product':
        return await ProductMiddleware.getAll({ shop, accessToken, count })

      case 'custom_collection':
        return await CustomCollectionMiddleware.getAll({ shop, accessToken, count })

      case 'smart_collection':
        return await SmartCollectionMiddleware.getAll({ shop, accessToken, count })

      case 'page':
        return await PageMiddleware.getAll({ shop, accessToken, count })

      case 'blog_post':
        return await BlogMiddleware.getAll({ shop, accessToken, count })

      case 'file':
        return await GraphqlFileMiddleware.getAll({ shop, accessToken, count })

      default:
        throw new Error('Invalid resource type')
    }
  } catch (error) {
    console.log('getResources error :>> ', error)
    throw error
  }
}

const getExportData = async ({ shop, accessToken, type, resources }) => {
  try {
    let dataList = []

    for (let i = 0, leng = resources.length; i < leng; i++) {
      console.log(`\t\t\[${i + 1}/${leng}] run`)
      let data = {}

      switch (type) {
        case 'product':
          data = await getProduct({ shop, accessToken, id: resources[i].id })
          break

        case 'custom_collection':
          data = await getCustomCollection({ shop, accessToken, id: resources[i].id })
          break

        case 'smart_collection':
          data = await getSmartCollection({ shop, accessToken, id: resources[i].id })
          break

        case 'page':
          data = await getPage({ shop, accessToken, id: resources[i].id })
          break

        case 'blog_post':
          data = await getBlog({ shop, accessToken, id: resources[i].id })
          break

        case 'file':
          data = { file: resources[i] }
          break

        default:
          throw new Error('Invalid resource type')
      }

      dataList.push(data)
      console.log(`\t\t\[${i + 1}/${leng}] completed`)
    }

    return dataList
  } catch (error) {
    console.log('getExportData error :>> ', error)
    throw error
  }
}

const convertData = (type, dataList) => {
  try {
    switch (type) {
      case 'product':
        return convertProduct(dataList)

      case 'custom_collection':
        return convertCustomCollection(dataList)

      case 'smart_collection':
        return convertSmartCollection(dataList)

      case 'page':
        return convertPage(dataList)

      case 'blog_post':
        return convertBlog(dataList)

      case 'file':
        return convertFile(dataList)

      default:
        throw new Error('Invalid resource type')
    }
  } catch (error) {
    console.log('convertData error :>> ', error)
    throw error
  }
}

const createCSV = (dataList) => {
  try {
    return csv(dataList)
  } catch (error) {
    throw error
  }
}

const uploadCDN = async ({ shop, accessToken, type, value }) => {
  try {
    return await cdn({ shop, accessToken, type, value })
  } catch (error) {
    throw error
  }
}

const revertData = (type, shop, data) => {
  try {
    switch (type) {
      case 'product':
        return revertProduct(shop, data)

      case 'custom_collection':
        return revertCustomCollection(shop, data)

      case 'smart_collection':
        return revertSmartCollection(shop, data)

      case 'page':
        return revertPage(shop, data)

      case 'blog_post':
        return revertBlog(shop, data)

      case 'file':
        return revertFile(shop, data)

      default:
        throw new Error('Invalid resource type')
    }
  } catch (error) {
    console.log('revertData error :>> ', error)
    throw error
  }
}

const createData = async ({ shop, accessToken, type, resources }) => {
  try {
    let dataList = []

    let productsHasOrigin =
      type === 'custom_collection'
        ? await getProductsWithOriginMetafields({ shop, accessToken })
        : []

    for (let i = 0, leng = resources.length; i < leng; i++) {
      console.log(`\t\t[${i + 1}/${leng}] run`)
      let data = {}

      switch (type) {
        case 'product':
          data = await createProduct({ shop, accessToken, data: resources[i] })
          break

        case 'custom_collection':
          let custom_collection = resources[i].custom_collection
          if (custom_collection.collects) {
            custom_collection.collects = custom_collection.collects
              .map((item) => productsHasOrigin.find((_item) => _item.origin.id == item))
              .filter((item) => item)
              .map((item) => ({ product_id: item.id }))
          }

          data = await createCustomCollection({
            shop,
            accessToken,
            data: { ...resources[i], custom_collection },
          })
          break

        case 'smart_collection':
          data = await createSmartCollection({ shop, accessToken, data: resources[i] })
          break

        case 'page':
          data = await createPage({ shop, accessToken, data: resources[i] })
          break

        case 'blog_post':
          data = await createBlog({ shop, accessToken, data: resources[i] })
          break

        case 'file':
          data = await createFile({ shop, accessToken, data: resources[i] })
          break

        default:
          throw new Error('Invalid type')
          break
      }

      dataList.push(data)
      console.log(`\t\t[${i + 1}/${leng}] completed`)
    }

    return dataList
  } catch (error) {
    console.log('createData error :>> ', error)
    throw error
  }
}

const handleFilename = (filename) => {
  try {
    let obj = {}
    let _filename = filename

    // extension
    obj.extension = _filename.split('.')[1]
    _filename = _filename.split('.')[0]

    // process
    obj.process = parseInt(_filename.substring(_filename.lastIndexOf('_') + 1, _filename.length))
    _filename = _filename.substring(0, _filename.lastIndexOf('_'))

    // type
    obj.type = _filename

    return obj
  } catch (error) {
    throw error
  }
}

const generatePackageName = (shop) => {
  try {
    let host = shop.replace(/.myshopify.com/g, '')
    let timestamp = new Date()
      .toISOString()
      .replace(/-/g, '')
      .replace(/\./g, '')
      .replace(/:/g, '')
      .replace(/T/g, '')
      .replace(/Z/g, '')

    return `backup_${host}_${timestamp}.zip`
  } catch (error) {
    throw error
  }
}

const handleImportFile = async (filepath) => {
  try {
    let zip = new AdmZip(filepath)

    let files = zip.getEntries()
    files = files.map((item) => {
      const file = item.toJSON()

      const { type } = handleFilename(file.name)
      const content = zip.readAsText(item)

      return { name: file.name, type, content }
    })

    // sort files
    let _files = []
    ValidResources.forEach((resourceType) =>
      files.forEach((file) => (file.type === resourceType ? _files.push(file) : null))
    )
    files = _files

    fs.unlink(filepath, (err) => {
      if (err) {
        console.log(`Delete import file failed: ${err.message}`)
      } else {
        // console.log(`Import file deleted`)
      }
    })

    return { files }
  } catch (error) {
    throw error
  }
}

const download = (url) => {
  try {
    return new Promise(function (resolve, reject) {
      request(
        {
          url: url,
          method: 'GET',
          encoding: null,
        },
        function (err, response, body) {
          if (err) {
            return reject(err)
          }
          resolve(body)
        }
      )
    })
  } catch (error) {
    throw error
  }
}

const unzip = (buffer) => {
  try {
    return new Promise(function (resolve, reject) {
      let zip = new AdmZip(buffer)

      let files = zip.getEntries() // an array of ZipEntry records

      files = files.map((item) => {
        const file = item.toJSON()

        const { type } = handleFilename(file.name)
        const content = zip.readAsText(item)

        return { name: file.name, type, content }
      })

      // sort files
      let _files = []
      ValidResources.forEach((resourceType) =>
        files.forEach((file) => (file.type === resourceType ? _files.push(file) : null))
      )
      files = _files

      resolve({ files })
    })
  } catch (error) {
    throw error
  }
}

const downloadAndUnzipFile = async (url) => {
  try {
    let buffer = await download(url)

    let { files } = await unzip(buffer)

    return { files }
  } catch (error) {
    throw error
  }
}

const groupData = (data) => {
  try {
    let resources = []

    data.forEach((row) => {
      let index = resources.map((item) => item['id']).indexOf(row['id'])
      if (index >= 0) {
        // already exist
        resources[index].rows.push(row)
      } else {
        // new item
        resources.push({ ['id']: row['id'], rows: [row] })
      }
    })

    return resources
  } catch (error) {
    throw error
  }
}

const DuplicatorActions = {
  getResources,
  getExportData,
  convertData,
  revertData,
  createData,
  createCSV,
  uploadCDN,
  handleFilename,
  generatePackageName,
  handleImportFile,
  download,
  downloadAndUnzipFile,
  groupData,
}

export default DuplicatorActions
