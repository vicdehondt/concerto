import { DataTypes, Op } from 'sequelize';
import * as express from 'express';
import {sequelize} from '../configs/sequelizeConfig'
import { Rating } from './Ratingmodel';
import { UserModel } from './Usermodel';
import { VenueModel } from './Venuemodel';
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
  finishedNotificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  banner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
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

export async function CreateEvent(userID, artistID, venueID, title, description, date, price, doors, main, support, genre1, genre2, url, bannerpath, eventPicturePath) {
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
      userID: userID,
      url: url
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


export async function retrieveUnfinishedEvents(limit, offset): Promise<typeof EventModel>  {
  const events = await EventModel.findAll({
    limit: limit,
    attributes: ['eventID', 'title', 'eventPicture', 'dateAndTime', 'baseGenre', 'secondGenre', 'price', 'amountCheckedIn'],
    include: [
      { model: Artist , attributes: {
        exclude: ['createdAt', 'updatedAt']
      }},
      { model: VenueModel, attributes: {
        exclude: ['createdAt', 'updatedAt']
      }}, { model: VenueModel, attributes: {
        exclude: ['createdAt', 'updatedAt']
      }},
    ], where: {
      dateAndTime: {
        [Op.gte]: expiredEventTreshold(),
      }
    }, order: [
      ['dateAndTime', 'ASC'] // Sort by 'dateAndTime' in ascending order
      ]
  });
  return events;
}

export async function retrieveNewUnfinishedEvents(limit, offset, checkedInEvents): Promise<typeof EventModel>  {
  const events = await EventModel.findAll({
    limit: limit,
    offset: offset,
    attributes: ['eventID', 'title', 'eventPicture', 'dateAndTime', 'baseGenre', 'secondGenre', 'price', 'amountCheckedIn'],
    include: [
      { model: Artist , attributes: {
        exclude: ['createdAt', 'updatedAt']
      }},
      { model: VenueModel, attributes: {
        exclude: ['createdAt', 'updatedAt']
      }}, { model: VenueModel, attributes: {
        exclude: ['createdAt', 'updatedAt']
      }},
    ], where: {
      dateAndTime: {
        [Op.gte]: expiredEventTreshold(),
      },
      eventID: {
        [Op.notIn]: checkedInEvents
      }
    }, order: [
      ['dateAndTime', 'ASC'] // Sort by 'dateAndTime' in ascending order
      ]
  });
  return events;
}

export async function RetrieveEvent(ID): Promise<typeof EventModel> {
  try {
    const Event = await EventModel.findOne({
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'venueID', 'artistID']
      }, include: [
        { model: Artist , attributes: {
          exclude: ['createdAt', 'updatedAt']
        }},
        { model: VenueModel, attributes: {
          exclude: ['createdAt', 'updatedAt']
        }},
      ],
      where: {eventID: ID},
    });
    return Event;
  } catch (error) {
    console.error("There was an error finding an event: ", error);
  }
}

export function createWhereClause(filterfields,filtervalues) {
  const whereClause = {};
  const orConditions = [];
  for (let i = 0; i < filterfields.length; i++) {
    const field = filterfields[i];
    const value = filtervalues[i];
    // need to add the condition to the where clause
    if(field == "maxpeople" || field == "price"){
      whereClause[field] = {
        [Op.between]: value.split('/'),
      };
    } else if (field == 'date') {
      const lowerDate = new Date(value);
      lowerDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(lowerDate);
      nextDay.setDate(lowerDate.getDate() + 1);
      whereClause['dateAndTime'] = {
        [Op.between]: [lowerDate, nextDay]
      }
    } else if (field == 'title') {
      whereClause['title'] = {
        [Op.like]: '%' + value + '%',
      }
    } else if (field == 'genre') {
      if (Array.isArray(value)) {
        orConditions.push({
          baseGenre: {
            [Op.in]: value,
          },
        });
        orConditions.push({
          secondGenre: {
            [Op.in]: value,
          },
        });
      } else {
        orConditions.push({
          baseGenre: value,
        });
        orConditions.push({
          secondGenre: value,
        });
      }
    } else {
      whereClause[field] = value;
    }
  }
  if (orConditions.length > 0) {
    whereClause[Op.or] = orConditions;
  } return whereClause;
}

//to limit the return if no filters are selected use the limit function from sqlite
export async function FilterEvents(filterfields, filtervalues, limit, offset){
  try {
    const whereClause = createWhereClause(filterfields, filtervalues);
    if (whereClause['dateAndTime'] == null) {
      whereClause['dateAndTime'] = { [Op.gte]: expiredEventTreshold() }
    }
    const events = await EventModel.findAll({
      limit: limit,
      offset: offset,
      attributes: ['eventID', 'title', 'eventPicture', 'dateAndTime', 'baseGenre', 'secondGenre', 'price', 'amountCheckedIn'],
      include: [
        { model: Artist , attributes: {
          exclude: ['createdAt', 'updatedAt']
        }},
        { model: VenueModel, attributes: {
          exclude: ['createdAt', 'updatedAt']
        }},
      ],
      where: whereClause,
      order: [
        ['dateAndTime', 'ASC'] // Sort by 'dateAndTime' in ascending order
        ]
    });
    return events;
  } catch (error) {
    console.error("There was an error filtering Events: ", error);
  }
}

export async function SearchEvents(searchvalue){
  try {
    const Events = await EventModel.findAll({
    attributes: ['eventID', 'title', 'eventPicture', 'dateAndTime', 'baseGenre', 'secondGenre', 'price', 'amountCheckedIn'],
    include: [
      { model: Artist , attributes: {
        exclude: ['createdAt', 'updatedAt']
      }},
      { model: VenueModel, attributes: {
        exclude: ['createdAt', 'updatedAt']
      }},
    ],
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

export function extractFilters(req: express.Request) {
  let filterfields: any[] = [];
  let filtervalues: any[] = [];
  if(req.query.price){
    filterfields.push("price");
    filtervalues.push(req.query.price);
  }
  if(req.query.venueID){
    filterfields.push("venueID");
    filtervalues.push(req.query.venueID);
  }
  if (req.query.genre) {
    filterfields.push("genre");
    filtervalues.push(req.query.genre);
  }
  if (req.query.title) {
    filterfields.push("title");
    filtervalues.push(req.query.title);
  }
  if (req.query.date) {
    filterfields.push("date");
    filtervalues.push(req.query.date);
  }
  return [filterfields, filtervalues];
}

