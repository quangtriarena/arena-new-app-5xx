import verifyToken from '../auth/verifyToken.js'
import ResponseHandler from '../helpers/responseHandler.js'

export default {
  submit: async (req, res) => {
    console.log('\n----------------------------------------')
    console.log('/api/submition')
    console.log('\n----------------------------------------')
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let data = null

      return ResponseHandler.success(res, data)
    } catch (error) {
      console.log('/api/submition error :>> ', error.message)
      return ResponseHandler.error(res, error)
    }
  },
}
