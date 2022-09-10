import verifyToken from '../auth/verifyToken.js'
import ErrorCodes from '../constants/errorCodes.js'
import ResponseHandler from '../helpers/responseHandler.js'
import BullmqJobMiddleware from '../middlewares/bullmq_job.js'
import DuplicatorPackageMiddleware from '../middlewares/duplicator_package.js'
import StoreSettingMiddleware from '../middlewares/store_setting.js'

export default {
  export: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let data = await BullmqJobMiddleware.create('duplicator_export', {
        ...req.body,
        shop,
      })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  import: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let data = await BullmqJobMiddleware.create('duplicator_import', {
        ...req.body,
        shop,
      })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  checkCode: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      const { uuid } = req.body

      let duplicatorStore = await StoreSettingMiddleware.findOne({ uuid })
        .then((res) => res)
        .catch((err) => {
          throw new Error('Invalid unique code')
        })

      if (storeSetting.uuid === uuid) {
        throw new Error('Duplicator store cannot be your store')
      }

      if (duplicatorStore.duplicators.find((item) => item.uuid === uuid)) {
        throw new Error('Cannot set your child store as your duplicator store')
      }

      let storeSetting = await StoreSettingMiddleware.findOne({ shop })

      if (storeSetting.duplicators.map((item) => item.uuid).includes(uuid)) {
        throw new Error('Duplicator store has already been taken')
      }

      let duplicators = storeSetting.duplicators || []
      duplicators.push({ uuid, shop: duplicatorStore.shop, name: duplicatorStore.name })
      duplicators = JSON.stringify(duplicators)

      storeSetting = await StoreSettingMiddleware.update(storeSetting.id, { duplicators })

      return ResponseHandler.success(res, storeSetting)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  find: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      const { uuid } = req.query

      let duplicatorStore = await StoreSettingMiddleware.findOne({ uuid })
        .then((res) => res)
        .catch((err) => {
          throw new Error('Duplicator store not found')
        })

      let where = JSON.parse(req.query.where || '{}')
      where = { ...where, shop: duplicatorStore.shop }

      let data = await DuplicatorPackageMiddleware.find({ ...req.query, where })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  findById: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      const { uuid } = req.query
      const { id } = req.params

      let duplicatorStore = await StoreSettingMiddleware.findOne({ uuid })
        .then((res) => res)
        .catch((err) => {
          throw new Error('Duplicator store cannot found')
        })

      let data = await DuplicatorPackageMiddleware.findOne({ id, shop: duplicatorStore.shop })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  update: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      const { id } = req.params

      let data = await DuplicatorPackageMiddleware.findOne({ id, shop })

      data = await DuplicatorPackageMiddleware.update(id, req.body)

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  delete: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      const { id } = req.params

      let data = await DuplicatorPackageMiddleware.findOne({ id, shop })

      DuplicatorPackageMiddleware.delete(id)

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },
}
