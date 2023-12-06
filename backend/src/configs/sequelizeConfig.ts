const { Sequelize, DataTypes, Op } = require('sequelize');

const databasePath = './src/SQLite/ConcertoDB.db';
const databaseDialect = 'sqlite';

export const sequelize = new Sequelize({
    dialect: databaseDialect,
    storage: databasePath,
    logging: false,
});

export async function synchronize() {
    await sequelize.sync();
}

