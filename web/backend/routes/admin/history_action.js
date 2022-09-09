import Controller from './../../controller/history_action.js'

export default function historyActionRoute(app) {
  app.get('/api/history-actions', Controller.find)
  app.get('/api/history-actions/:id', Controller.findById)
  app.put('/api/history-actions/:id', Controller.update)
  app.delete('/api/history-actions/:id', Controller.delete)
}
