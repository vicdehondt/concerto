const { Sequelize, DataTypes, Op } = require('sequelize');
import * as config from '../configs/config'
import { RetrieveUser, UserModel } from './Usermodel';
import { EventModel, RetrieveEvent} from './Eventmodel';

const sequelize = new Sequelize({
    dialect: config.databaseDialect,
    storage: config.databasePath,
    logging: false
  });

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

export async function userCheckIn(userID, eventID): Promise<boolean> {
    const checkIn = await CheckedInUsers.findOne({
        where: {
            [Op.and]: [
                { userID: userID },
                { eventID: eventID }
            ]
        }
    }); if (checkIn != null) {
        await CheckedInUsers.create({
            userID: userID,
            eventID: eventID
        });
        return true;
    } else {
        return false;
    }
}





