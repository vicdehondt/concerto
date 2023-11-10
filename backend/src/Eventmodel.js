const { Sequelize, DataTypes, Op } = require('sequelize');
const fs = require('fs');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './src/SQLite/ConcertoDB.db'
  });

  const EventModel = sequelize.define('Event', {
    eventID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
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
      type: DataTypes.BLOB,
      allowNull: false
    }
  }, {
      tableName: 'Events'
  });

  async function synchronize() {
    EventModel.sync()
  }

  // Temporary way to deal with images
  const imageFilePath = './src/eventimages/ariana.jpeg';
  const imageBuffer = fs.readFileSync(imageFilePath);

  async function CreateEvent(id, title, description, people, date, price, image) {
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

  async function RetrieveEvent(ID) {
    try {
      const Event = await EventModel.findOne({
      where: {eventID: ID},
      });
      console.log(Event);
      return Event;
    } catch (error) {
      console.error("There was an error finding Event: ", error);
    }
  }

  synchronize()


  module.exports = {
    RetrieveEvent,
    CreateEvent
  }

