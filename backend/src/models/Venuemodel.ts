import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { EventModel } from './Eventmodel';
import { Rating } from './Ratingmodel';

//events belong to venue
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

VenueModel.hasOne(Rating, {
    foreignKey: {
        name: 'entityID',
        allowNull: false
    }
  });
  Rating.hasOne(VenueModel, {
    foreignKey: {
        name: 'ratingID',
    }
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

export async function CreateVenue(venueID, venueName, longitude, latitude): Promise<void> {
    try {
        const result = await VenueModel.create({
            venueID: venueID,
            venueName: venueName,
            longitude: longitude,
            lattitude: latitude,
        });
        result
    } catch (error) {
        console.error("There was an error creating a Venue:", error);
    }
}

export async function retrieveVenue(id) {
  try {
    const Venue = await VenueModel.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      where: {venueID: id},
    });
    return Venue;
  } catch (error) {
    console.error("There was an error finding a venue: ", error);
  }
}