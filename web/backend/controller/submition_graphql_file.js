import ResponseHandler from '../helpers/responseHandler.js'
import verifyToken from '../auth/verifyToken.js'
import AwsMiddleware from '../middlewares/aws.js'
import GraphqlFileMiddleware from '../middlewares/graphql_file.js'

export default {
  submit: async (req, res) => {
    console.log('\n----------------------------------------')
    console.log('/api/submition')
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let data = null

      // let all = await GraphqlFileMiddleware.getAll({ shop, accessToken })
      // console.log('all :>> ', all)

      // let items = await GraphqlFileMiddleware.find({ shop, accessToken })
      // console.log('items :>> ', items)

      let created = await GraphqlFileMiddleware.create({
        shop,
        accessToken,
        variables: {
          files: {
            alt: 'sample image',
            contentType: 'IMAGE',
            originalSource:
              'https://cdn.shopify.com/s/files/1/0039/3940/1774/products/61s5HMpNO8L._SL1200.jpg?v=1661584941',
          },
        },
      })
      console.log('created :>> ', created)

      console.log('/api/submition data :>> ', data)

      return ResponseHandler.success(res, data)
    } catch (error) {
      console.log('/api/submition error :>> ', error.message)
      return ResponseHandler.error(res, error)
    }
  },
}
