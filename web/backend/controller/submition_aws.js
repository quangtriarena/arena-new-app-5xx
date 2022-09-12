import ResponseHandler from '../helpers/responseHandler.js'
import verifyToken from '../auth/verifyToken.js'
import AwsMiddleware from '../middlewares/aws.js'

export default {
  submit: async (req, res) => {
    console.log('\n----------------------------------------')
    console.log('/api/submition')
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let data = null

      let key = 'welcome.txt'
      // let key = 'test/welcome.txt'
      // let key = 'abc/baby-blue.png'
      console.log('key :>> ', key)

      await AwsMiddleware.uploadFile(key, 'welcome!')
        .then((res) => console.log('created :>> ', res))
        .catch((err) => console.log('create file error:', err.message))

      await AwsMiddleware.getFileByKey(key)
        .then((res) => console.log('file :>> ', res))
        .catch((err) => console.log('get file error:', err.message))

      await AwsMiddleware.deleteFile(key)
        .then((res) => console.log('deleted :>> ', res))
        .catch((err) => console.log('delete file error:', err.message))

      console.log('/api/submition data :>> ', data)

      return ResponseHandler.success(res, data)
    } catch (error) {
      console.log('/api/submition error :>> ', error.message)
      return ResponseHandler.error(res, error)
    }
  },
}
