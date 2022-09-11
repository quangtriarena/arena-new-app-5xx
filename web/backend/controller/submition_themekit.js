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

const testExport = async ({ shop, accessToken, themeId }) => {
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

const testImport = async ({ shop, accessToken, themeId, url }) => {
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
  await themeKit.command(
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

export default {
  submit: async (req, res) => {
    console.log('----------------------------------------')
    console.log('/api/submition')
    console.log('----------------------------------------')
    try {
      const session = await verifyToken(req, res)
      const { shop, accessToken } = session

      const themeId = 134439469281
      // const themeId = 134439403745

      let data = null

      // data = await testExport({ shop, accessToken, themeId: 134439469281 })
      data = await testImport({
        shop,
        accessToken,
        url: 'https://arena-installation-new.s3.amazonaws.com/haloha-shop-134439469281.zip',
        themeId: 134439403745,
      })

      return ResponseHandler.success(res, data)
    } catch (error) {
      console.log('/api/submition error :>> ', error.message)
      return ResponseHandler.error(res, error)
    }
  },
}
