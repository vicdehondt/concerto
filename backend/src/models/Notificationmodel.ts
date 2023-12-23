import { DataTypes } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { UserModel } from './Usermodel';

// Stores all the information about a notificaton: its id, who triggered it, the type of notification and the id of the object it is about.
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

// A notification is an instance which the user can receive.
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

// Each user can trigger many notificatons.
UserModel.hasMany(NotificationObject, {
    foreignKey: 'actor'
});
// A notificationObject can only be triggered by max. one user.
NotificationObject.belongsTo(UserModel, {
    foreignKey: 'actor'
});

// But there can be many notifications about one object.
NotificationObject.hasMany(Notification, {
    foreignKey: {
        name: 'objectID',
        allowNull: false,
    }
});
// Each notification belongs to exactly one object.
Notification.belongsTo(NotificationObject, {
    foreignKey: {
        name: 'objectID',
    }
});
// A user can receive many notifications.
UserModel.hasMany(Notification, {
    foreignKey: {
        name: 'receiver',
        allowNull: false,
    }
});
// Each notification can be received by only one user.
Notification.belongsTo(UserModel, {
    foreignKey: {
        name: 'receiver',
    }
});