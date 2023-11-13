const { Sequelize, DataTypes, Op } = require('sequelize');
import { STRING } from 'sequelize';
import * as config from '../config'
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
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    maxPeople: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    price: {
      type: DataTypes.REAL,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
      tableName: 'Events'
  });

  async function synchronize() {
    EventModel.sync()
  }

  export async function CreateEvent(id, title, description, people, date, price, image) {
    try {
      const Event = await EventModel.create({
        eventID: id,
        title: title,
        description: description,
        maxPeople: people,
        datetime: date,
        price: price,
        image: image
      });
    } catch (error) {
      console.error("There was an error creating an event: ", error);
    }
  };

  export async function RetrieveEvent(ID): Promise<typeof EventModel> {
    try {
      const Event = await EventModel.findOne({
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
      // Add the condition to the where clause
        whereClause[field] = value;
      }
      const Event = await EventModel.findAll({
        where: whereClause,
      });
      return Event;
    } catch (error) {
      console.error("There was an error filtering Events: ", error);
    }
  }

  synchronize()

