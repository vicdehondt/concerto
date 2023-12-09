import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { Rating } from './Ratingmodel';
import { UserModel } from './Usermodel';
const axios = require('axios');

export const Artist = sequelize.define('Artist', {
  artistID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
  name: {
      type: DataTypes.STRING,
      allowNull: false
  },
  type: {
      type: DataTypes.STRING,
      allowNull: false
  },
});

Artist.hasOne(Rating, {
  foreignKey: 'artistID',
  allowNull: true
});
Rating.belongsTo(Artist, {
  foreignKey: 'artistID',
  allowNull: true
});

export const genres = DataTypes.ENUM('pop', 'rock', 'metal', 'country')

export const EventModel = sequelize.define('Event', {
  eventID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amountCheckedIn: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  dateAndTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  price: {
    type: DataTypes.REAL,
    allowNull: false
  },
  support: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  doors: {
    type: DataTypes.STRING,
    allowNull: false
  },
  main: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  baseGenre: {
    type: genres,
    allowNull: false,
  },
  secondGenre: {
    type: genres,
    allowNull: false
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventPicture: {
    type: DataTypes.STRING,
    allowNull: false
  }}, {
    tableName: 'Events'
});

UserModel.hasMany(EventModel, {
  foreignKey: 'userID',
  allowNull: false,
});

EventModel.belongsTo(UserModel, {
  foreignKey: 'userID',
  allowNull: false,
});

Artist.hasMany(EventModel, {
  foreignKey: {
    name: 'artistID',
    allowNull: false
  }
});

EventModel.belongsTo(Artist, {
  foreignKey: 'artistID'
});

var lastRequest = new Date();
const timeTreshold = 1000; // Musicbrainz API has limit of maximum 1 request per second.

export async function createArtist(id) {
  const currentTime = new Date();
  if ((currentTime.getTime() - lastRequest.getTime()) < timeTreshold) {
    console.log("Too many requests to musicbrainz!!!")
    return false;
  } else {
    lastRequest = new Date();
    const musicBrainzApiUrl = `http://musicbrainz.org/ws/2/artist/${id}?fmt=json`;
    try {
      const response = await axios.get(musicBrainzApiUrl);
      const data = await response.data
      const result = await Artist.create({
        name: data.name,
        artistID: data.id,
        type: data.type
      });
      const rating = await Rating.create({
        entityType: 'artist',
        artistID: result.artistID,
      });
      result.ratingID = rating.ratingID;
      result.save();
      return true;
    }
    catch (err) {
      console.log("Error thrown from musicbrainz API. Often because the artist ID is wrong!")
      return false;
    }
  }
}

export async function retrieveArtist(id) {
  const result = await Artist.findByPk(id, {
    attributes: {
        exclude: ['createdAt', 'updatedAt']
    },
    include: {
        model: Rating,
        attributes: ['score', 'amountOfReviews', 'ratingID']
    }
  }); return result;
}

export async function CreateEvent(userID, artistID, venueID, title, description, date, price, doors, main, support, genre1, genre2, bannerpath, eventPicturePath) {
  try {
    const Event = await EventModel.create({
      artistID: artistID,
      venueID: venueID,
      title: title,
      description: description,
      dateAndTime: date,
      price: price,
      banner: bannerpath,
      eventPicture: eventPicturePath,
      doors: doors,
      main: main,
      support: support,
      baseGenre: genre1,
      secondGenre: genre2,
      userID: userID
    });
    return Event;
  } catch (error) {
    console.error("There was an error creating an event: ", error);
  }
};

export function expiredEventTreshold() {
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  return yesterday;
}

export async function retrieveUnfinishedEvents(): Promise<typeof EventModel>  {
  const events = await EventModel.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }, where: {
      dateAndTime: {
        [Op.gte]: expiredEventTreshold(),
      }
    }
  });
  return events;
}

export async function RetrieveEvent(ID): Promise<typeof EventModel> {
  try {
    const Event = await EventModel.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      where: {eventID: ID},
    });
    return Event;
  } catch (error) {
    console.error("There was an error finding an event: ", error);
  }
}

  //to limit the return if no filters are selected use the limit function from sqlite
  export async function FilterEvents(filterfields,filtervalues){
    try {
      const whereClause = {};
      for (let i = 0; i < filterfields.length; i++) {
        const field = filterfields[i];
        const value = filtervalues[i];
        // need to add the condition to the where clause
        if(field == "maxpeople" || field == "price"){
          whereClause[field] = {
            [Op.between]: value.split('/'),
          };
        } else {
          whereClause[field] = value;
        }
      }
      const Event = await EventModel.findAll({
        where: whereClause,
      });
      return Event;
    } catch (error) {
      console.error("There was an error filtering Events: ", error);
    }
  }

  export async function SearchEvents(searchvalue){
    try {
      const Events = await EventModel.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      where: {
        title: { //for now only searching on title, need to add location...
            [Op.like]: '%' + searchvalue + '%',
          }
        }
      });
      return Events;
    } catch (error) {
      console.error("There was an error finding an event: ", error);
    }
  }

  export function isFinished(event): boolean {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    return event.dateAndTime < yesterday;
  }

