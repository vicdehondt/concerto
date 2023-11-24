import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { EventModel } from './Eventmodel';

//events belong to venue
//check if there exist a database for coordinates

export const VenueModel = sequelize.define('Venue', {
  locationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  locationName: {
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
    foreignKey: 'locationID', //will be used as the definition of the extra column
    onDelete: 'CASCADE',
});

EventModel.belongsTo(VenueModel, {//one event has one venue
    //on delete defaults to set null
});

async function synchronize() {
    EventModel.sync(); //creating an extra column locationID in the Event table 
  }

export async function CreateVenue(locationID, locationName, longitude, lattitude): Promise<void> {
    try {
        const User = await VenueModel.create({
            locationID: locationID,
            locationName: locationName,
            longitude: longitude,
            lattitude: lattitude,
        });
    } catch (error) {
        console.error("There was an error creating a Venue:", error);
    }
}

export async function RetrieveAllVenues(): Promise<typeof EventModel> {

}


export async function RetrieveVenue(ID): Promise<typeof EventModel> {

}