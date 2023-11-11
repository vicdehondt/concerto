const { Sequelize, DataTypes, Op } = require('sequelize');
import * as config from '../config'

const sequelize = new Sequelize({
    dialect: config.databaseDialect,
    storage: config.databasePath
})

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
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image: { type: DataTypes.BLOB,
            allowNull: false
    }}, {
    tableName: 'Users'
    }
)

async function synchronize() {
    UserModel.sync()
  }

export async function CreateUser(username, email, hashedpassword, saltingrounds, profilepicture): Promise<void> {
    try {
        const User = await UserModel.create({
            username: username,
            mail: email,
            password: hashedpassword,
            salt: saltingrounds,
            image: profilepicture
        });
    } catch (error) {
        console.error("There was an error creating a user:", error);
    }
}

synchronize()

