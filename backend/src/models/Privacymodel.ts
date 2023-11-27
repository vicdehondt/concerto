import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'

const whoCanView = DataTypes.ENUM('public', 'friends', 'private');

export const PrivacySetting = sequelize.define('Privacy', {
    privacyID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    newEvents: {
        type: whoCanView,
        allowNull: false,
    },
    attendedEvents: {
        type: whoCanView,
        allowNull: false
    },
    friends: {
        type: whoCanView,
        allowNull: false
    }
});