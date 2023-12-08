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
        allowNull: true
    }
  });
  Rating.hasOne(VenueModel, {
    foreignKey: {
        name: 'ratingID',
    }
  });

VenueModel.hasMany(EventModel, { //multiple events can take place at one venue
    foreignKey: {
      name: 'venueID',
      allowNull: false
    }
});

EventModel.belongsTo(VenueModel, {//one event has one venue
    foreignKey: {
      name: 'venueID'
    }
});

export async function CreateVenue(venueID, venueName, longitude, latitude): Promise<void> {
    try {
        const result = await VenueModel.create({
            venueID: venueID,
            venueName: venueName,
            longitude: longitude,
            lattitude: latitude,
        });
        const rating = await Rating.create({
          entityType: 'venue',
        });
        result.ratingID = rating.ratingID;
        result.save();
        return result;
    } catch (error) {
        console.error("There was an error creating a Venue:", error);
    }
}

export async function retrieveVenue(id) {
  try {
    const Venue = await VenueModel.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }, include: {
        model: Rating,
        attributes: ['score', 'amountOfReviews']
    },
      where: {venueID: id},
    });
    return Venue;
  } catch (error) {
    console.error("There was an error finding a venue: ", error);
  }
}