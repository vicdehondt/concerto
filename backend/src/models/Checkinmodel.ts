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
    foreignKey: 'userID'
});

EventModel.belongsToMany(UserModel, {
    through: CheckedInUsers,
    onDelete: 'CASCADE',
    foreignKey: 'eventID'
});

// CheckedInUsers.belongsTo(UserModel, { foreignKey: 'userID' });
// CheckedInUsers.belongsTo(EventModel, { foreignKey: 'eventID' });

export async function retrieveCheckIn(user, event) {
    const result = await CheckedInUsers.findOne({
        where: {
            [Op.and]: [
                { userID: user },
                { eventID: event.eventID }
            ]
        }
    });
    return result;
}

export async function userCheckIn(userID, event): Promise<boolean> {
    const checkIn = await retrieveCheckIn(userID, event);
    if (checkIn == null) {
        await CheckedInUsers.create({
            userID: userID,
            eventID: event.eventID
        });
        event.checkedIn = event.checkedIn + 1;
        await event.save();
        return true;
    } else {
        return false;
    }
}

export async function userCheckOut(userID, event): Promise<boolean> {
    const checkIn = await retrieveCheckIn(userID, event.eventID);
    if (checkIn != null) {
        await checkIn.destroy();
        event.checkedIn = event.checkedIn - 1;
        await event.save();
        return true;
    } else {
        return false;
    }
}
export async function allCheckedInUsers(eventid) {
    const users = await CheckedInUsers.findAll({
        attributes: ['userID'],
        where: {
            eventID: eventid,
        },
    }); console.log(users);
    const result = await Promise.all(users.map(async checkin => {
        const user = await UserModel.findOne({
            attributes: ['userID', 'username', 'image'],
            where: {
                userID: checkin.userID,
            }
        }); return user;
    }));
    return result;
}

export async function allCheckedInEvents(userID) {
    const user = await UserModel.findByPk(userID, {
        include: [{
            model: EventModel,
        }]
    });
    const events = await user.getEvents({
        attributes: ['eventID', 'eventPicture', 'title'],
    });
    const cleanedEvents = events.map(event => {
        const { CheckedInUser, ...eventWithoutCheckedInUser } = event.toJSON();
        return eventWithoutCheckedInUser;
    });
    return cleanedEvents;
}