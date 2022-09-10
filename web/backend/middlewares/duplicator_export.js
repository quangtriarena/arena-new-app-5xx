import HistoryActionMiddleware from './history_action.js'
import StoreSettingMiddleware from './store_setting.js'
import DuplicatorActions from './duplicator_actions.js'
import AdminZipMiddleware from './adm_zip.js'
import AwsMiddleware from './aws.js'
import DuplicatorPackageMiddleware from './duplicator_package.js'

const LIMIT_PER_PROCESS = 100

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
    const { duplicatorPackageId, logId } = historyAction.data

    // get storeSetting
    let storeSetting = await StoreSettingMiddleware.findOne({ shop: job.data.shop })
    const { shop, accessToken } = storeSetting

    // get duplicatorPackage
    let duplicatorPackage = await DuplicatorPackageMiddleware.findById(duplicatorPackageId)
    let log = duplicatorPackage.logs.find((item) => item.id === logId)

    /**
     * process
     */
    let message = ''
    let result = null

    // create zip file
    const filename = DuplicatorActions.generatePackageName(shop)
    const rootDir = `./temp/`
    const filepath = rootDir + filename
    const zip = await AdminZipMiddleware.create(filepath)
    console.log(`zip file created ${filepath}`)

    for (let ii = 0, iileng = historyAction.data.resources.length; ii < iileng; ii++) {
      console.log(`[${ii + 1}/${iileng}] run`)

      const { type, count } = historyAction.data.resources[ii]

      // get all resources
      console.log(`| get all resources...`)
      let resources = await DuplicatorActions.getResources({ shop, accessToken, type, count })
      console.log(`| total resources ${resources.length}`)

      for (let i = 0, leng = Math.ceil(resources.length / LIMIT_PER_PROCESS); i < leng; i++) {
        console.log(`\t[${i + 1}/${leng}] run`)

        let _resouces = resources.slice(i * LIMIT_PER_PROCESS, (i + 1) * LIMIT_PER_PROCESS)

        // get export data
        console.log(`\t| get export data...`)
        let exportData = await DuplicatorActions.getExportData({
          shop,
          accessToken,
          type,
          resources: _resouces,
        })
        console.log(`\t| total export data ${exportData.length}`)

        // convert data to rows data
        let convertedData = DuplicatorActions.convertData(type, exportData)
        console.log(`\t| total rows ${convertedData.length}`)

        // create csv content
        let csvContent = DuplicatorActions.createCSV(convertedData)
        console.log(`\t| total characters ${csvContent.length}`)

        // update zip file
        let _order = i + 1
        _order = _order < 10 ? `00${_order}` : _order < 100 ? `0${_order}` : _order
        let _filename = `${type}/${type}_${_order}.csv`
        await AdminZipMiddleware.update(filepath, [{ filename: _filename, content: csvContent }])
        console.log(`\t| zip file updated ${_filename}`)

        console.log(`\t[${i + 1}/${leng}] completed`)
      }

      // update historyAction
      historyAction = await HistoryActionMiddleware.update(historyActionId, {
        status: 'RUNNING',
        progress: Math.ceil(((ii + 1) / iileng) * 100),
      })

      console.log(`[${ii + 1}/${iileng}] completed`)
    }

    // upload to s3
    let uploaded = await AwsMiddleware.upload(filename, filepath)
    console.log(`zip file uploaded into s3`)
    console.log(uploaded.Location)

    result = { Location: uploaded.Location, Key: uploaded.Key }

    // update historyAction
    historyAction = await HistoryActionMiddleware.update(historyActionId, {
      status: 'COMPLETED',
      progress: 100,
      message,
      result: result ? JSON.stringify(result) : null,
    })

    // update duplicatorPackage
    log = {
      ...log,
      status: 'COMPLETED',
      message,
      result,
      updatedAt: new Date().toISOString(),
    }
    duplicatorPackage = await DuplicatorPackageMiddleware.updateLog(duplicatorPackageId, log)
  } catch (error) {
    // update historyAction
    const historyAction = await HistoryActionMiddleware.update(historyActionId, {
      status: error.status || 'FAILED',
      message: error.message,
    })
    const { duplicatorPackageId, logId } = historyAction.data

    // update duplicatorPackage
    let duplicatorPackage = await DuplicatorPackageMiddleware.findById(duplicatorPackageId)
    let log = duplicatorPackage.logs.find((item) => item.id === logId)
    log = {
      ...log,
      status: error.status || 'FAILED',
      message: error.message,
      updatedAt: new Date().toISOString(),
    }
    duplicatorPackage = await DuplicatorPackageMiddleware.updateLog(duplicatorPackageId, log)

    throw error
  }
}

const DuplicatorExportMiddleware = { create }

export default DuplicatorExportMiddleware
