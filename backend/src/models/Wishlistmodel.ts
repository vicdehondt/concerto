import { DataTypes} from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { EventModel } from './Eventmodel';
import { UserModel } from './Usermodel';

export const WishListedEvents = sequelize.define('WishListedEvent', {
    wishlistID: {
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
    },
    eventID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Events',
            key: 'eventID',
        },
    }}
);

UserModel.belongsToMany(EventModel, {
    through: WishListedEvents,
    foreignKey: 'userID'
});

EventModel.belongsToMany(UserModel, {
    through: WishListedEvents,
    foreignKey: 'eventID'
});

WishListedEvents.belongsTo(UserModel, { foreignKey: 'userID' });
WishListedEvents.belongsTo(EventModel, { foreignKey: 'eventID' });

export async function getAllWishListed(userID: number) {
    const result = await WishListedEvents.findAll({
        where: {
            userID: userID
        }
    });
    return result;
}

export async function wishlistEvent(userID, eventID) {
    const check = await WishListedEvents.findOne({
        where: {
            userID: userID,
            eventID: eventID
        }
    });
    if (check == null) {
        console.log("about to create new wishlist");
        await WishListedEvents.create({
            userID: userID,
            eventID: eventID,
        });
        return true;
    } else {
        return false;
    }
}

export async function removeWishlist(userID: number, eventID: number) {
    const check = await WishListedEvents.findOne({
        where: {
            userID: userID,
            eventID: eventID
        }
    });
    if (check != null) {
        await check.destroy();
        return true;
    } else {
        return false;
    }
}


