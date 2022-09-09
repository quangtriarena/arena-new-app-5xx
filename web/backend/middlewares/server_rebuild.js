import HistoryActionMiddleware from './history_action.js'
import { Op } from 'sequelize'
import DuplicatorPackageMiddleware from './duplicator_package.js'

const ServerRebuildMiddleware = async () => {
  try {
    /**
     * Handle cancel all background jobs
     */
    HistoryActionMiddleware.find({
      page: 1,
      limit: 1000,
      where: { [Op.or]: [{ status: 'PENDING' }, { status: 'RUNNING' }] },
    })
      .then((res) => {
        const backgroundJobs = res.items

        backgroundJobs.forEach((backgroundJob) => {
          HistoryActionMiddleware.update(backgroundJob.id, {
            status: 'CANCELED',
            message: 'Canceled by rebuilding the server.',
          })
            .then((backgroundJob) => {
              const { type } = backgroundJob
              const { duplicatorPackageId, logId } = backgroundJob.data

              if (type == 'duplicator_export' && duplicatorPackageId) {
                DuplicatorPackageMiddleware.findById(duplicatorPackageId)
                  .then((duplicatorPackage) => {
                    let log = duplicatorPackage.logs.find((item) => item.id === logId)
                    if (log) {
                      log = {
                        ...log,
                        status: 'CANCELED',
                        message: 'Canceled by rebuilding the server.',
                        updatedAt: new Date().toISOString(),
                      }

                      DuplicatorPackageMiddleware.updateLog(duplicatorPackageId, log)
                        .then((duplicatorPackage) => {})
                        .catch((err) => null)
                    }
                  })
                  .catch((err) => null)
              }
            })
            .catch((err) => null)
        })
      })
      .catch((err) => null)
  } catch (error) {
    console.log(`ServerRebuildMiddleware error`, error)
  }
}

export default ServerRebuildMiddleware
