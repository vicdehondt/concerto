import { DataTypes, Op } from 'sequelize';
import {sequelize} from '../configs/sequelizeConfig'
import { Friend } from './Usermodel';
const fs = require('fs');

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
  banner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventPicture: {
    type: DataTypes.STRING,
    allowNull: false
  }
  }, {
    tableName: 'Events'
});

async function synchronize() {
  EventModel.sync();
  Friend.sync();
}

export async function CreateEvent(title, description, date, price, bannerpath, picturepath) {
  try {
    const Event = await EventModel.create({
      title: title,
      description: description,
      dateAndTime: date,
      price: price,
      banner: bannerpath,
      eventPicture: picturepath,
    });
  } catch (error) {
    console.error("There was an error creating an event: ", error);
  }
};

export async function RetrieveAllEvents(): Promise<typeof EventModel>  {
  const events = await EventModel.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    }
  });
  return events;
}

export async function RetrieveEvent(ID): Promise<typeof EventModel> {
  try {
    const Event = await EventModel.findOne({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
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

synchronize()

