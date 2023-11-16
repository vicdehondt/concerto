import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { RetrieveUser, UserModel } from './Usermodel';
import { EventModel, RetrieveEvent} from './Eventmodel';

const CheckedInUsers = sequelize.define('CheckedInUser', {
    checkinID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'userID',
        },
        onDelete: 'CASCADE',
    },
    eventID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Events',
            key: 'eventID',
        },
        onDelete: 'CASCADE',
    },}, {
        tableName: "CheckedInUsers",
    }
);

UserModel.belongsToMany(EventModel, {
    through: CheckedInUsers,
    onDelete: 'CASCADE',
})

EventModel.belongsToMany(UserModel, {
    through: CheckedInUsers,
    onDelete: 'CASCADE',
})

async function retrieveCheckIn(user, event) {
    const result = CheckedInUsers.findOne({
        where: {
            [Op.and]: [
                { userID: user },
                { eventID: event }
            ]
        }
    });
    return result;
}

export async function userCheckIn(userID, eventID): Promise<boolean> {
    const checkIn = await retrieveCheckIn(userID, eventID);
    if (checkIn == null) {
        await CheckedInUsers.create({
            userID: userID,
            eventID: eventID
        });
        return true;
    } else {
        return false;
    }
}

export async function userCheckOut(userID, eventID): Promise<boolean> {
    const checkIn = await retrieveCheckIn(userID, eventID);
    if (checkIn != null) {
        await checkIn.destroy();
        return true;
    } else {
        return false;
    }
}







