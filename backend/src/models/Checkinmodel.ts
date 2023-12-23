import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { UserModel } from './Usermodel';
import { Artist, EventModel, expiredEventTreshold } from './Eventmodel';
import { VenueModel } from './Venuemodel';

// Table to store which users have checked in for each event.
export const CheckedInUsers = sequelize.define('CheckedInUser', {
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

// A many-to-many relationship is defined between the user and event tables
UserModel.belongsToMany(EventModel, {
    through: CheckedInUsers,
    foreignKey: 'userID'
});

EventModel.belongsToMany(UserModel, {
    through: CheckedInUsers,
    foreignKey: 'eventID'
});

CheckedInUsers.belongsTo(UserModel, { foreignKey: 'userID' });
CheckedInUsers.belongsTo(EventModel, { foreignKey: 'eventID' });

// procedure which returns either a checkin instance or null
export async function retrieveCheckIn(userID, event) {
    const result = await CheckedInUsers.findOne({
        where: {
            [Op.and]: [
                { userID: userID },
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
        event.amountCheckedIn = event.amountCheckedIn + 1;
        await event.save();
        return true;
    } else {
        return false;
    }
}

// procedure which returns true if a user is able to check in for the event, and false if he was unable to
export async function userCheckOut(userID, event): Promise<boolean> {
    const checkIn = await retrieveCheckIn(userID, event);
    if (checkIn != null) {
        await checkIn.destroy();
        event.amountCheckedIn = event.amountCheckedIn - 1;
        await event.save();
        return true;
    } else {
        return false;
    }
}

// procedure which returns all unfinished events the user has checked in for
export async function allCheckedInEvents(userID) {
    return await checkinsFinder(userID, false);
}
async function checkinsFinder(userID, finished) {
    const checkins = await CheckedInUsers.findAll({
        attributes: ['eventID'],
        where: {
            userID: userID
        }
    });
    const eventIDs = checkins.map(event => {
        return event.eventID
    });
    const whereClause = {
        eventID: {
            [Op.in]: eventIDs,
        }
    }
    if (finished) {
        whereClause['dateAndTime'] = {
            [Op.lt]: expiredEventTreshold()
           }
    } else {
        whereClause['dateAndTime'] = {
         [Op.gte]: expiredEventTreshold()
        }
    }
    const events = await EventModel.findAll({
        attributes: ['eventID', 'eventPicture', 'title', 'dateAndTime'],
        include: [
            { model: Artist, attributes: ['artistID', 'name']},
            { model: VenueModel, attributes: ['venueID', 'venueName'] }
        ],
        where: whereClause
    });
    return events;
}

// procedure which returns all finished events the user has checked in for
export async function allAttendedEvents(userID) {
    return await checkinsFinder(userID, true);
}