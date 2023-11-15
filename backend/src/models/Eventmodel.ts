const { Sequelize, DataTypes, Op } = require('sequelize');
import { STRING } from 'sequelize';
import * as config from '../config'
import { Friend } from './Usermodel';
const fs = require('fs');

const sequelize = new Sequelize({
    dialect: config.databaseDialect,
    storage: config.databasePath,
    logging: false
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
    checkedin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    datetime: {
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
    profilepicture: {
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
        datetime: date,
        price: price,
        banner: bannerpath,
        profilepicture: picturepath,
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

  export async function FilterEvents(maxpeople, datetime, price){
    try {
      const Event = await EventModel.findAll({
      where: {
        maxpeople: maxpeople,
        datetime: datetime,
        price: price,
      },
      });
      return Event;
    } catch (error) {
      console.error("There was an error filtering Events: ", error);
    }
  }

  synchronize()

