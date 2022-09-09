import verifyToken from '../auth/verifyToken.js'
import ErrorCodes from '../constants/errorCodes.js'
import ResponseHandler from '../helpers/responseHandler.js'
import HistoryActionMiddleware from '../middlewares/history_action.js'

export default {
  find: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let where = JSON.parse(req.query.where || '{}')
      where = { ...where, shop }

      let data = await HistoryActionMiddleware.find({ ...req.query, where })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  findById: async (req, res) => {
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      const { id } = req.params

      let data = await HistoryActionMiddleware.findOne({ id, shop })

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

      let data = await HistoryActionMiddleware.findOne({ id, shop })

      data = await HistoryActionMiddleware.update(id, req.body)

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

      let data = await HistoryActionMiddleware.findById({ id, shop })

      data = await HistoryActionMiddleware.delete(id)

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },
}
