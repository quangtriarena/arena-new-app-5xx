import apiCaller from '../helpers/apiCaller'

const PackageVersionApi = {
  count: async (query) => {
    return await apiCaller(`/api/package-versions/count${query || ''}`)
  },

  find: async (query) => {
    return await apiCaller(`/api/package-versions${query || ''}`)
  },

  findById: async (id) => {
    return await apiCaller(`/api/package-versions/${id}`)
  },

  update: async (id, data) => {
    return await apiCaller(`/api/package-versions/${id}`, 'PUT', data)
  },

  delete: async (id) => {
    return await apiCaller(`/api/package-versions/${id}`, 'DELETE')
  },
}

export default PackageVersionApi
