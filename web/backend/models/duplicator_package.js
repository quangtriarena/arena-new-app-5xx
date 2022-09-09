import PostgresSequelize from '../connector/postgres/index.js'
import { DataTypes } from 'sequelize'

const Model = PostgresSequelize.define('duplicator_packages', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  shop: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'),
    defaultValue: 'ACTIVE',
  },
  resources: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
  logs: {
    type: DataTypes.JSON,
    defaultValue: null,
  },
})

Model.prototype.toJSON = function () {
  let values = Object.assign({}, this.get())

  values.resources =
    values.resources && typeof values.resources === 'string' ? JSON.parse(values.resources) : []
  values.logs = values.logs && typeof values.logs === 'string' ? JSON.parse(values.logs) : []

  return values
}

Model.sync()

export default Model
