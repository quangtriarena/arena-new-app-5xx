import HistoryActionMiddleware from './history_action.js'
import StoreSettingMiddleware from './store_setting.js'
import DuplicatorActions from './duplicator_actions.js'
import csvtojson from 'csvtojson'
import DuplicatorPackageMiddleware from './duplicator_package.js'

const create = async (job) => {
  const { historyActionId } = job.data

  try {
    // get historyAction
    let historyAction = await HistoryActionMiddleware.findById(historyActionId)

    // check historyAction is running
    if (!['PENDING', 'RUNNING'].includes(historyAction.status)) {
      throw { status: historyAction.status, message: historyAction.message }
    }

    // update historyAction status PENDING -> RUNNING
    historyAction = await HistoryActionMiddleware.update(historyActionId, { status: 'RUNNING' })
    const { uuid, duplicatorPackageId, logId } = historyAction.data

    // get storeSetting
    let storeSetting = await StoreSettingMiddleware.findOne({ shop: job.data.shop })
    const { shop, accessToken } = storeSetting

    // get duplicatorStore
    let duplicatorStore = await StoreSettingMiddleware.findOne({ uuid })

    // get duplicatorPackage
    let duplicatorPackage = await DuplicatorPackageMiddleware.findById(duplicatorPackageId)
    let log = duplicatorPackage.logs.find((item) => item.id === logId)

    /**
     * process
     */
    let message = ''
    let result = []

    // download and unzip files
    const { files } = await DuplicatorActions.downloadAndUnzipFile(log.result.Location)

    console.log(`Import files:`)
    console.log(files.map((file) => file.name))

    for (let ii = 0, iileng = files.length; ii < iileng; ii++) {
      console.log(`[${ii + 1}/${iileng}] run`)

      const { type, content } = files[ii]

      // convert csv content to json data
      let jsonData = await csvtojson().fromString(content)
      console.log(`| total json data ${jsonData.length}`)

      // revert json data to entry
      let resources = DuplicatorActions.revertData(type, duplicatorStore.shop, jsonData)
      console.log(`| total resources ${resources.length}`)

      console.log(`\t| import data...`)
      let importedList = await DuplicatorActions.createData({
        shop,
        accessToken,
        type,
        resources,
      })
      console.log(`\t| total imported ${importedList.length}`)

      result.push({ type, result: importedList })

      // update historyAction
      historyAction = await HistoryActionMiddleware.update(historyActionId, {
        status: 'RUNNING',
        progress: Math.ceil(((ii + 1) / iileng) * 100),
      })

      console.log(`[${ii + 1}/${iileng}] completed`)
    }

    // update historyAction
    historyAction = await HistoryActionMiddleware.update(historyActionId, {
      status: 'COMPLETED',
      progress: 100,
      message,
      result: result ? JSON.stringify(result) : null,
    })
  } catch (error) {
    // update historyAction
    let historyAction = await HistoryActionMiddleware.update(historyActionId, {
      status: error.status || 'FAILED',
      message: error.message,
    })

    throw error
  }
}

const DuplicatorImportMiddleware = { create }

export default DuplicatorImportMiddleware
