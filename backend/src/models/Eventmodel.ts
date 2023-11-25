import { ARRAY, DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { Rating } from './Ratingmodel';
const fs = require('fs');

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
  }
});

Artist.hasOne(Rating, {
  foreignKey: {
      name: 'entityID',
      allowNull: false
  }
});
Rating.hasOne(Artist, {
  foreignKey: {
      name: 'ratingID',
  }
});

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
  checkedIn: {
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

// Artist.hasMany(EventModel, {
//   foreignKey: {
//     name: 'artistID',
//     allowNull: false
//   }
// });

// EventModel.belongsTo(Artist, {
//   foreignKey: 'artistID'
// });

export async function CreateArtist(name, id, type) {
  console.log(name, id, type);
  const result = await Artist.create({
    name: name,
    artistID: id,
    type: type
  });
  const rating = await Rating.create({
    entityType: 'artist',
    entityID: result.artistID,
  });
  result.ratingID = rating.ratingID;
  result.save();
  return result;
}

export async function retrieveArtist(id) {
  const result = await Artist.findByPk(id, {
    attributes: {
        exclude: ['createdAt', 'updatedAt']
    },
    include: {
        model: Rating,
        attributes: ['score', 'amountOfReviews']
    }
  }); return result;
}

export async function CreateEvent(title, description, date, price, doors, main, support, bannerpath, eventPicturePath) {
  try {
    const Event = await EventModel.create({
      title: title,
      description: description,
      dateAndTime: date,
      price: price,
      banner: bannerpath,
      eventPicture: eventPicturePath,
      doors: doors,
      main: main,
      support: support
    });
  } catch (error) {
    console.error("There was an error creating an event: ", error);
  }
};

export async function RetrieveAllEvents(): Promise<typeof EventModel>  {
  const events = await EventModel.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
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

