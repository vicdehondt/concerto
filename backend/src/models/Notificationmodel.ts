import { DataTypes } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { UserModel } from './Usermodel';
import { newNotification, notificationEmitter } from '../configs/emitterConfig';

export const NotificationObject = sequelize.define('NotificationObject', {
    ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    notificationType: {
        type: DataTypes.ENUM('friendrequestreceived', 'friendrequestaccepted', 'eventInviteReceived', 'reviewEvent'),
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
    const result = await Notification.create({
        receiver: receiverID,
        objectID: objectID
    });
    const improved_result = await Notification.findByPk(result.notificationID, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include: {
                model: NotificationObject,
                attributes: ['notificationType', 'actor', 'typeID']
        }
    });
    notificationEmitter.emit(newNotification, JSON.stringify(improved_result));
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

export const deleteNotificationReply = {
    SUCCES: 0,
    UNFOUND: 1,
    ILLEGAL: 2,
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