import verifyToken from '../auth/verifyToken.js'
import ResponseHandler from '../helpers/responseHandler.js'
import themeKit from '@shopify/themekit'
import path from 'path'
import fs from 'fs'
import ThemeMiddleware from '../middlewares/theme.js'
import AdminZipMiddleware from '../middlewares/adm_zip.js'
import AwsMiddleware from '../middlewares/aws.js'
import DuplicatorActions from '../middlewares/duplicator_actions.js'
import AdmZip from 'adm-zip'
import BullmqJobMiddleware from '../middlewares/bullmq_job.js'

export default {
  submit: async (req, res) => {
    console.log('----------------------------------------')
    console.log('/api/submition')
    console.log('----------------------------------------')
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      let data = null

      // data = await BullmqJobMiddleware.create('duplicator_export', {
      //   shop,
      //   name: 'test',
      //   description: 'test',
      //   resources: [{ type: 'theme', id: 134439469281 }],
      // })
      // data = await BullmqJobMiddleware.create('duplicator_import', {
      //   shop,
      //   uuid: 'daa7a513-8856-4211-9027-8978bbe38520',
      //   duplicatorPackageId: 11,
      //   logId: 1662889118550,
      //   themeId: 134439403745,
      // })

      return ResponseHandler.success(res, data)
    } catch (error) {
      console.log('/api/submition error :>> ', error.message)
      return ResponseHandler.error(res, error)
    }
  },
}
