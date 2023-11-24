import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { UserModel } from './Usermodel';

export const NotificationObject = sequelize.define('NotificationObject', {
    ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    notificationType: {
        type: DataTypes.ENUM('friendrequestreceived', 'friendrequestaccepted', 'eventInviteReceived'),
        allowNull: false,
    },
    actor: {
        type: DataTypes.INTEGER,
        references: {
            model: UserModel,
            key: 'userID'
        }
    },
    typeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
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

export async function createNewNotification(objectID, receiverID) {
    await Notification.create({
        receiver: receiverID,
        objectID: objectID
    });
}

export async function userNotifications(userid) {
    const result = await Notification.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        where: {
            receiver: userid
        },
        include: {
                model: NotificationObject,
                attributes: ['notificationType', 'actor', 'typeID']
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
UserModel.hasMany(NotificationObject, {
    foreignKey: 'actor'
});
NotificationObject.belongsTo(UserModel, {
    foreignKey: 'actor'
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