import HistoryActionMiddleware from './history_action.js'
import StoreSettingMiddleware from './store_setting.js'
import DuplicatorActions from './duplicator_actions.js'
import csvtojson from 'csvtojson'
import DuplicatorPackageMiddleware from './duplicator_package.js'
import ThemeMiddleware from './theme.js'
import AdminZipMiddleware from './adm_zip.js'
import themekit from '@shopify/themekit'
import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'

const importTheme = async ({ shop, accessToken, themeId, url }) => {
  const zipFilepath = './temp/' + url.split('/')[url.split('/').length - 1]

  let theme = await ThemeMiddleware.findById({ shop, accessToken, id: themeId })
  theme = theme.theme
  console.log('theme :>> ', theme)

  let config = `${theme.role === 'main' ? 'production:' : 'development:'}
      password: ${accessToken}
      theme_id: "${themeId}"
      store: ${shop}`
  console.log('config :>> ', config)

  // download
  const buffer = await DuplicatorActions.download(url)

  // read files
  let zip = new AdmZip(buffer)
  let files = zip.getEntries() // an array of ZipEntry records
  files = files.map((item) => {
    const file = item.toJSON()
    const content = zip.readAsText(item)

    return { filepath: item.entryName, filename: item.name, content }
  })
  console.log(`total files: ${files.length}`)

  // create zip file
  await AdminZipMiddleware.create(zipFilepath)
  console.log('zipFilepath :>> ', zipFilepath)

  // update zip file
  for (let i = 0; i < files.length; i++) {
    let { filepath, filename, content } = files[i]

    await AdminZipMiddleware.update(zipFilepath, [{ filename: filepath, content }])
  }
  console.log(`all files updated into zip file`)

  // extract zip file
  let extractedDir = await AdminZipMiddleware.extract(zipFilepath, '')
  console.log('extractedDir :>> ', extractedDir)

  // create theme kit config file
  await fs.writeFileSync(`${extractedDir}/config.yml`, config, 'utf8')
  console.log(`theme kit config file created`)

  // deploy theme
  await themekit.command(
    'deploy',
    {
      env: theme.role === 'main' ? 'production' : 'development',
      allowLive: theme.role === 'main' ? true : false,
    },
    {
      cwd: path.join(
        process.cwd(),
        'temp',
        extractedDir.split('/')[extractedDir.split('/').length - 1]
      ),
    }
  )

  // remove download directory
  fs.rmSync(extractedDir, { recursive: true, force: true })
  fs.unlink(zipFilepath, () => {})
}

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
    const { uuid, duplicatorPackageId, logId, themeId } = historyAction.data

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

    let themeResource = log.resources.find((item) => item.type === 'theme')

    if (themeResource?.type === 'theme') {
      await importTheme({ shop, accessToken, themeId, url: log.result.Location })
    } else {
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
