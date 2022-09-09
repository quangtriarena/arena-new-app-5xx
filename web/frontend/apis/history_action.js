import apiCaller from '../helpers/apiCaller'

const HistoryActionApi = {
  rerun: async (id) => {
    return await apiCaller(`/api/history-actions-rerun/${id}`)
  },

  find: async (query) => {
    return await apiCaller(`/api/history-actions${query || ''}`)
  },

  findById: async (id) => {
    return await apiCaller(`/api/history-actions/${id}`)
  },

  update: async (id, data) => {
    return await apiCaller(`/api/history-actions/${id}`, 'PUT', data)
  },

  delete: async (id) => {
    return await apiCaller(`/api/history-actions/${id}`, 'DELETE')
  },
}

export default HistoryActionApi
