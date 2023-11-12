const { Sequelize, DataTypes, Op } = require('sequelize');
import * as config from '../config'

const sequelize = new Sequelize({
    dialect: config.databaseDialect,
    storage: config.databasePath,
    logging: false,
})

export const UserModel = sequelize.define('User', {
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
        type: DataTypes.STRING,
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

export const Friend = sequelize.define('Friend', {
    friendshipID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    inviterID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }}, {
    tableName: 'Friends'
    }
)

async function synchronize() {
    UserModel.sync();
    Friend.sync();
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

export async function RetrieveUser(field: string, value): Promise<typeof UserModel> {
    try {
        const User = await UserModel.findOne({
        where: { [field]: value},
        });
        return User;
      } catch (error) {
        console.error("There was an error finding a user: ", error);
      }
}

function FindFriends(userID) {
    Friend.findAll({
      where: {
        [Op.or]: [{InviterID: userID}, {receiverID: userID}],
        status:'accepted'
      }
    })
  }

  export async function SendFriendRequest(senderID, receiverID){
    const receiver = await RetrieveUser("userID", receiverID);
    if (receiver != null) {
        const friendship = await Friend.create({
            inviterID: senderID,
            receiverID: receiverID,
            status: 'requested'
          });
    } else {
        throw new Error("The other user does not exist!");
    }
  }

synchronize()

