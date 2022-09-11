import HistoryActionMiddleware from './history_action.js'
import StoreSettingMiddleware from './store_setting.js'
import DuplicatorActions from './duplicator_actions.js'
import AdminZipMiddleware from './adm_zip.js'
import AwsMiddleware from './aws.js'
import DuplicatorPackageMiddleware from './duplicator_package.js'
import ThemeMiddleware from './theme.js'
import themeKit from '@shopify/themekit'
import fs from 'fs'
import path from 'path'

const LIMIT_PER_PROCESS = 100

const exportTheme = async ({ shop, accessToken, themeId }) => {
  let theme = await ThemeMiddleware.findById({ shop, accessToken, id: themeId })
  theme = theme.theme
  console.log('theme :>> ', theme)

  let config = `${theme.role === 'main' ? 'production:' : 'development:'}
      password: ${accessToken}
      theme_id: "${themeId}"
      store: ${shop}`
  console.log('config :>> ', config)

  let folderName = shop.replace('.myshopify.com', `-${themeId}`)
  let downloadDir = `./temp/${folderName}`
  let zipFilepath = `./temp/${folderName}.zip`

  // create download directory
  try {
    await fs.mkdirSync(downloadDir)
    console.log(`download directory created`)
  } catch (error) {
    if (error.message.includes('file already exists')) {
      console.log(`download directory already exists`)
    } else {
      throw error
    }
  }

  // create theme kit config file
  await fs.writeFileSync(`${downloadDir}/config.yml`, config, 'utf8')
  console.log(`theme kit config file created`)

  // download theme
  await themeKit.command(
    'download',
    {
      env: theme.role === 'main' ? 'production' : 'development',
      allowLive: theme.role === 'main' ? true : false,
    },
    {
      cwd: path.join(process.cwd(), 'temp', folderName),
    }
  )

  // create zip file
  await AdminZipMiddleware.create(zipFilepath)
  console.log(`zip file created ${zipFilepath}`)

  // read files
  let filepaths = []
  let files = await fs.readdirSync(downloadDir)
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    let filepath = `${downloadDir}/${file}`
    let isDirectory = fs.lstatSync(`${downloadDir}/${file}`).isDirectory()

    if (isDirectory) {
      let _files = await fs.readdirSync(`${downloadDir}/${file}`)
      for (let j = 0; j < _files.length; j++) {
        let _file = _files[j]
        let _filepath = `${downloadDir}/${file}/${_file}`
        let _isDirectory = fs.lstatSync(`${downloadDir}/${file}/${_file}`).isDirectory()

        if (_isDirectory) {
          let __files = await fs.readdirSync(`${downloadDir}/${file}/${_file}`)
          for (let k = 0; k < __files.length; k++) {
            let __file = __files[k]
            let __filepath = `${downloadDir}/${file}/${_file}/${__file}`

            filepaths.push(__filepath)
          }
        } else {
          filepaths.push(_filepath)
        }
      }
    } else {
      filepaths.push(filepath)
    }
  }
  filepaths = filepaths.filter((item) => !item.includes('config.yml'))
  console.log(`total theme files: ${filepaths.length}`)

  // update zip file
  for (let i = 0; i < filepaths.length; i++) {
    let filepath = filepaths[i]
    let filename = filepath.replace(`${downloadDir}/`, '')
    let content = await fs.readFileSync(filepath, 'utf8')

    await AdminZipMiddleware.update(zipFilepath, [{ filename, content }])
  }
  console.log(`all files updated into zip file`)

  // upload into s3
  console.log(`upload file into s3...`)
  let uploaded = await AwsMiddleware.upload(
    zipFilepath.split('/')[zipFilepath.split('/').length - 1],
    zipFilepath
  )
  console.log(`zip file uploaded into s3`)

  // remove download directory
  fs.rmSync(downloadDir, { recursive: true, force: true })
  fs.unlink(zipFilepath, () => {})

  console.log(uploaded)

  return uploaded
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

    let themeResource = historyAction.data.resources.find((item) => item.type === 'theme')

    if (themeResource) {
      result = await exportTheme({ shop, accessToken, themeId: themeResource.id })
    } else {
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
    }

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
