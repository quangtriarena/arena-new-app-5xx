import GraphqlFileMiddleware from './graphql_file.js'

export default async ({ shop, accessToken, data }) => {
  try {
    const { file } = data

    let result = {}

    /**
     * create file
     */
    let fileCreated = { ...file }

    fileCreated = await GraphqlFileMiddleware.create({
      shop,
      accessToken,
      variables: {
        files: fileCreated,
      },
    })
      .then((res) => {
        console.log(`\t\t\t file created ${res.id}`)
        result = { success: true, id: res.id }
        return res
      })
      .catch((err) => {
        console.log(`\t\t\t create file failed: ${err.message}`)
        result = { success: false, message: err.message }
        return null
      })

    if (!result.success) {
      return result
    }

    return result
  } catch (error) {
    throw error
  }
}
