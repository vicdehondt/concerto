import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { EventModel } from './Eventmodel';

//events belong to venue
//check if there exist a database for coordinates

export const VenueModel = sequelize.define('Venue', {
  venueID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  venueName: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lattitude: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  }, {
    tableName: 'Venues'
});

VenueModel.hasMany(EventModel, { //multiple events can take place at one venue
    foreignKey: 'venueID', //will be used as the definition of the extra column
    onDelete: 'CASCADE',
});

EventModel.belongsTo(VenueModel, {//one event has one venue
    //on delete defaults to set null
});

async function synchronize() {
    EventModel.sync(); //creating an extra column venueID in the Event table 
  }

export async function CreateVenue(venueID, venueName, longitude, lattitude): Promise<void> {
    try {
        const result = await VenueModel.create({
            venueID: venueID,
            venueName: venueName,
            longitude: longitude,
            lattitude: lattitude,
        });
        result
    } catch (error) {
        console.error("There was an error creating a Venue:", error);
    }
}