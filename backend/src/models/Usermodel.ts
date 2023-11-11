const { Sequelize, DataTypes, Op } = require('sequelize');
import * as config from '../config'

const sequelize = new Sequelize({
    dialect: config.databaseDialect,
    storage: config.databasePath
})

const salt  = 12

const UserModel = sequelize.define('User', {
    userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    mail: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    salt: {
        type: DataTypes.TEXT,
        allowNull: false
    }}, {
        tableName: 'Users'
    }
)

async function synchronize() {
    UserModel.sync()
  }

synchronize()

