import { Queue, Worker } from 'bullmq'
import HistoryActionMiddleware from './history_action.js'
import DuplicatorExportMiddleware from './duplicator_export.js'
import DuplicatorImportMiddleware from './duplicator_import.js'
import DuplicatorPackageMiddleware from './duplicator_package.js'
import StoreSettingMiddleware from './store_setting.js'

let MyQueues = []

/**
 *
 * @param {String} queueName
 * @returns Object
 */
const createNewQueue = (queueName) => {
  const myQueue = new Queue(queueName, {
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  })

  const worker = new Worker(
    queueName,
    async (job) => {
      console.log(`${queueName} ${job.data.__type} ${job.id} run`)

      console.log(`|---------------------------------------------------`)
      Object.keys(job.data).forEach((key) => console.log(`| ${key}: ${job.data[key]}`))
      console.log(`|---------------------------------------------------`)

      try {
        switch (job.data.__type) {
          case 'duplicator_export':
            await DuplicatorExportMiddleware.create(job)
            break

          case 'duplicator_import':
            await DuplicatorImportMiddleware.create(job)
            break

          default:
            break
        }
      } catch (error) {
        console.log(`${queueName} ${job.data.__type} ${job.id} throw error: ${error.message}`)
      }
    },
    { concurrency: 1 }
  )

  worker.on('completed', async (job) => {
    console.log(`${queueName} ${job.data.__type} ${job.id} has completed`)

    const { historyActionId } = job.data

    // get historyAction
    let historyAction = await HistoryActionMiddleware.findById(historyActionId)
    const { duplicatorPackageId, logId } = historyAction.data
    console.log('historyAction :>> ', historyAction)

    // get duplicatorPackage
    if (job.data.__type === 'duplicator_export' && duplicatorPackageId && logId) {
      let duplicatorPackage = await DuplicatorPackageMiddleware.findById(duplicatorPackageId)
      // console.log('duplicatorPackage :>> ', duplicatorPackage)
      console.log(
        'log :>> ',
        duplicatorPackage.logs.find((item) => item.id === logId)
      )
    }

    // remove job
    job.remove()
  })

  worker.on('failed', async (job, err) => {
    console.log(`${queueName} ${job.data.__type} ${job.id} has failed: ${err.message}`)

    // remove job
    job.remove()
  })

  worker.on('removed', async (job) => {
    console.log(`${queueName} ${job.data.__type} ${job.id} has removed`)
  })

  return myQueue
}

const create = async (__type, data) => {
  console.log('\n------------------------------------------------')
  console.log('__type :>> ', __type)
  console.log('data :>> ', data)
  console.log('------------------------------------------------')
  try {
    let __data = { ...data }

    let duplicatorPackage = null
    let duplicatorStore = null

    let log = null

    switch (__type) {
      case 'duplicator_export':
        log = {
          id: Date.now(),
          name: data.name,
          description: data.description,
          resources: data.resources,
          status: 'PENDING',
          message: '',
          result: null,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }

        // create or update duplicatorPackage
        if (data.duplicatorPackageId) {
          duplicatorPackage = await DuplicatorPackageMiddleware.findOne({
            id: data.duplicatorPackageId,
            shop: data.shop,
          })
            .then((res) => res)
            .catch((res) => {
              throw new Error('Package not found')
            })

          // check if any logId
          if (data.logId) {
            log = duplicatorPackage.logs.find((item) => item.id == data.logId)

            if (!log) {
              throw new Error('Package log not found')
            }

            log = {
              ...log,
              status: 'PENDING',
              message: '',
              result: null,
              updatedAt: new Date().toISOString(),
            }

            duplicatorPackage.logs = duplicatorPackage.logs.map((item) =>
              item.id == data.logId ? log : item
            )
          } else {
            duplicatorPackage.logs.unshift(log)
          }

          duplicatorPackage = await DuplicatorPackageMiddleware.update(data.duplicatorPackageId, {
            shop: data.shop,
            name: data.name,
            description: data.description,
            resources: data.resources,
            logs: duplicatorPackage.logs,
          })
        } else {
          duplicatorPackage = await DuplicatorPackageMiddleware.create({
            shop: data.shop,
            name: data.name,
            description: data.description,
            resources: data.resources,
            logs: [log],
          })
        }

        __data = {
          ...__data,
          duplicatorPackageId: duplicatorPackage.id,
          logId: log.id,
        }
        break

      case 'duplicator_import':
        // get duplicatorStore
        duplicatorStore = await StoreSettingMiddleware.findOne({ uuid: data.uuid })
          .then((res) => res)
          .catch((err) => {
            throw new Error('Invalid duplicator store')
          })

        // get duplicatorPackage
        duplicatorPackage = await DuplicatorPackageMiddleware.findOne({
          id: data.duplicatorPackageId,
          shop: duplicatorStore.shop,
        })
          .then((res) => res)
          .catch((res) => {
            throw new Error('Invalid package')
          })

        log = duplicatorPackage.logs.find((item) => item.id == data.logId)
        if (!log) {
          throw new Error('Package log not found')
        }
        if (!log.result?.Location) {
          throw new Error('Package is not ready to use')
        }

        __data = { ...__data, duplicatorPackageId: duplicatorPackage.id, logId: log.id }
        break

      default:
        break
    }

    // create historyAction
    let historyAction = await HistoryActionMiddleware.create({
      type: __type,
      shop: data.shop,
      data: JSON.stringify(__data),
    })

    // --------------------------------------------
    /**
     * Add job to queue
     */
    // create queue name
    let myQueue = null
    let queueName = data.shop.replace(/.myshopify.com/g, '__queue')
    for (let i = 0; i < MyQueues.length; i++) {
      if (MyQueues[i].name === queueName) {
        myQueue = MyQueues[i]
        break
      }
    }
    if (!myQueue) {
      myQueue = createNewQueue(queueName)
      MyQueues.push(myQueue)
    }

    // init job
    let jobName = `${queueName}_${Date.now()}`
    let jobData = { __type, shop: data.shop, historyActionId: historyAction.id }

    let job = await myQueue.add(jobName, jobData)
    // --------------------------------------------

    return { id: job.id, name: job.name }
  } catch (error) {
    console.log('BullmqJobMiddleware.create error :>> ', error.message)
    throw error
  }
}

const BullmqJobMiddleware = { create }

export default BullmqJobMiddleware
