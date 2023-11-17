import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'

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

Friend.belongsTo(UserModel, {
    foreignKey: 'senderID',
    as: 'sender',
    onDelete: 'CASCADE',
});

Friend.belongsTo(UserModel, {
    foreignKey: 'receiverID',
    as: 'receiver',
    onDelete: 'CASCADE',
});

UserModel.belongsToMany(UserModel, {
    through: Friend,
    as: 'sender',
    foreignKey: 'senderID',
    onDelete: 'CASCADE',
});

UserModel.belongsToMany(UserModel, {
    through: Friend,
    as: 'receiver',
    foreignKey: 'receiverID',
    onDelete: 'CASCADE',
});

async function synchronize() {
    UserModel.sync();
    Friend.sync();
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
        include: [
            { model: UserModel, as: 'receiver', attributes: ['userID', 'username', 'image' ]},
            { model: UserModel, as: 'sender', attributes: ['userID', 'username', 'image' ]},
        ],
        where: {
            status: 'accepted',
            [Op.or]: [
                { receiverID: userID },
                { senderID: userID }
            ]
        }
    });
    const result = friends.map(friendrelationship => {
        var friend = null;
        if (friendrelationship.receiverID == userID) {
            friend = friendrelationship.sender;
        } else {
            friend = friendrelationship.receiver;
        };
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

async function FindFriend(senderID, receiverID) { // Procedure does not work in 2 way;
    const existing = await Friend.findOne({
        where: {
            [Op.or]: [
                {
                    [Op.and]: [
                        { receiverID: senderID },
                        { senderID: receiverID },
                    ]
                }, {
                    [Op.and]: [
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
    ILLEGALREQUEST: 3,
}

export async function SendFriendRequest(senderID, receivername): Promise<Number> {
    const receiver = await RetrieveUser('username', receivername);
    if (receiver != null) {
        const receiverid = receiver.userID;
        if (receiverid != senderID) {
            const existing = await FindFriend(senderID, receiverid);
            if (existing == null) {
                await CreateFriend(senderID, receiverid);
                const object = await NotificationObject.create({
                    notificationType: 'friendrequest',
                    actor: senderID,
                });
                await createNewNotification(object.ID, receiverid);
                return FriendInviteResponses.SENT;
            } else {
                return FriendInviteResponses.ALREADYFRIEND;
            }
        } else {
            return FriendInviteResponses.ILLEGALREQUEST;
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

export const NotificationObject = sequelize.define('NotificationObject', {
    ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    notificationType: {
        type: DataTypes.ENUM('friendrequest'),
        allowNull: false,
    },
    actor: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'userID'
        }
    }
});

UserModel.hasMany(NotificationObject, {
    foreignKey: 'actor'
});
NotificationObject.belongsTo(UserModel, {
    foreignKey: 'actor'
});

export const Notification = sequelize.define('Notification', {
    notificationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    receiver: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: UserModel,
            key: 'userID'
        }
    },
    status: {
        type: DataTypes.ENUM('unseen', 'seen'),
        allowNul: false,
        defaultValue: 'unseen'
    }
});

NotificationObject.hasMany(Notification, {
    foreignKey: {
        name: 'objectID',
        allowNull: false,
    }
});
Notification.belongsTo(NotificationObject, {
    foreignKey: {
        name: 'objectID',
    }
});

UserModel.hasMany(Notification, {
    foreignKey: {
        name: 'receiver',
        allowNull: false,
    }
});
Notification.belongsTo(UserModel, {
    foreignKey: {
        name: 'receiver',
    }
});

export async function createNewNotification(objectID, receiverID) {
    await Notification.create({
        receiver: receiverID,
        objectID: objectID
    });
}

export async function userNotifications(userid) {
    const result = await Notification.findAll({
        attributes: ['notificationID', 'status'],
        where: {
            receiver: userid
        },
        include: {
                model: NotificationObject,
                attributes: ['notificationType', 'actor']
        }
    });
    return result;
}

export async function notificationSeen(id) {
    const result = await Notification.findByPk(id);
    if (result != null) {
        result.status = 'seen';
        result.save();
        return true;
    } else {
        return false
    }
}

export const deleteNotificationReply = {
    SUCCES: 0,
    UNFOUND: 1,
    ILLEGAL: 2,
}
export async function deleteNotification(userid, notificationid) {
    const notification = await Notification.findByPk(notificationid);
    if (notification != null) {
        if (notification.receiver == userid) {
            await notification.destroy();
            return deleteNotificationReply.SUCCES;
        } else {
            return deleteNotificationReply.ILLEGAL;
        }
    } else {
        return deleteNotificationReply.UNFOUND;
    }
}