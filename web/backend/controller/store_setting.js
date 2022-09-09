import verifyToken from '../auth/verifyToken.js'
import ResponseHandler from '../helpers/responseHandler.js'
import BillingMiddleware, { APP_BILLINGS } from '../middlewares/billing.js'
import StoreSettingMiddleware from '../middlewares/store_setting.js'

export default {
  auth: async (req, res) => {
    try {
      const session = await verifyToken(req, res)

      let data = await StoreSettingMiddleware.init(session)

      /**
       * Check billings
       */
      if (data.billings.length) {
        let billings = data.billings
        let billing = null
        let updated = false

        for (let i = 0; i < billings.length; i++) {
          if (['pending', 'active'].includes(billings[i].status)) {
            billing = await BillingMiddleware.get({
              shop: session.shop,
              accessToken: session.accessToken,
              type: billings[i].type,
              id: billings[i].id,
            })
            billing = billing[billings[i].type]

            if (billing.status !== billings[i].status) {
              updated = true

              billings[i] = { ...billings[i], status: billing.status }

              if (billing.status === 'active') {
                let appBilling = APP_BILLINGS.find((item) => item.id === billings[i].app_billing_id)

                switch (billings[i].type) {
                  case 'application_charge':
                    data.credits += appBilling.credits[data.appPlan]
                    break

                  case 'recurring_application_charge':
                    data.appPlan = appBilling.plan
                    break

                  default:
                    break
                }
              }
            }
          }
        }

        if (updated) {
          // remove draft billings
          billings = billings.filter((item) => ['pending', 'active'].includes(item.status))

          data = await StoreSettingMiddleware.update(data.id, {
            billings: JSON.stringify(billings),
            appPlan: data.appPlan,
            credits: data.credits,
          })
        }
      }

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  update: async (req, res) => {
    try {
      const session = await verifyToken(req, res)

      const { acceptedAt } = req.body

      let data = await StoreSettingMiddleware.init(session)

      data = await StoreSettingMiddleware.update(data.id, { acceptedAt })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },
}
