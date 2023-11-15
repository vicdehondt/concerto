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
    image: { type: DataTypes.STRING,
            allowNull: true
    }}, {
    tableName: 'Users'
    }
)

export const Friend = sequelize.define('Friend',{
    friendID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('accepted', 'pending'),
        allowNull: false,
    },
})

UserModel.belongsToMany(UserModel, {
    through: Friend,
    as: 'SenderFriends',
    foreignKey: 'senderID',
    onDelete: 'CASCADE',
});

UserModel.belongsToMany(UserModel, {
    through: Friend,
    as: 'ReceiverFriends',
    foreignKey: 'receiverID',
    onDelete: 'CASCADE',
});

async function synchronize() {
    UserModel.sync();
  }

export async function DeleteUser(userID) {
    await UserModel.destroy({
        where: {
            userID: userID,
        }
    });
}

export async function CreateUser(username, email, hashedpassword, saltingrounds): Promise<void> {
    try {
        const User = await UserModel.create({
            username: username,
            mail: email,
            password: hashedpassword,
            salt: saltingrounds,
        });
    } catch (error) {
        console.error("There was an error creating a user:", error);
    }
}

async function AcceptFriendRequest(friendID) {
    const friendrequest = await Friend.findByPK(friendID);
    friendrequest.status = 'accepted';
    friendrequest.save();
}

export async function GetAllFriends(userID) {
    const friends = await Friend.findAll({
        attributes: ['receiverID', 'senderID'],
        where: {
            status: 'accepted',
            [Op.or]: [
                { receiverID: userID },
                { senderID: userID }
            ]
        }
    });
    const result = await friends.map( async friendrelationship => {
        var friendID = null;
        if (friendrelationship.receiverID == userID) {
            friendID = friendrelationship.senderID;
        } else {
            friendID = friendrelationship.receiverID;
        } const friend = await RetrieveUser('userID', friendID);
        return friend;
    });
    return result;
}

async function CreateFriend(senderID, receiverID) {
    const newfriend = await Friend.create({
        status: 'accepted',
        senderID: senderID,
        receiverID: receiverID,
    });
}

async function FindFriend(senderID, receiverID) {
    const existing = await Friend.findOne({
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        { receiverID: senderID },
                        { senderID: receiverID },
                    ], [Op.and]: [
                        { receiverID: receiverID },
                        { senderID: senderID },
                    ]
                }
            ]
        }
    });
    return existing;
}

export const FriendInviteResponses = {
    SENT: 0,
    ALREADYFRIEND: 1,
    USERNOTFOUND: 2,
}

export async function SendFriendRequest(senderID, receivername): Promise<Number> {
    const receiver = await RetrieveUser('username', receivername);
    if (receiver != null) {
        const receiverid = receiver.userID;
        const existing = await FindFriend(senderID, receiverid);
        if (existing == null) {
            await CreateFriend(senderID, receiverid);
            return FriendInviteResponses.SENT;
        } else {
            return FriendInviteResponses.ALREADYFRIEND;
        }
    } else {
        return FriendInviteResponses.USERNOTFOUND;
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

synchronize();

